import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DisputeAuthorType,
  DisputeStatus,
  NotificationType,
  OrderProofKind,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { MediaService } from '../media/media.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { buildOrderScopeFilter, type OrderScope } from '../orders/order-scope.util';
import { AsaasPayoutsService } from '../payments/asaas/asaas-payouts.service';
import {
  calcNetPayoutFromOrders,
  calculateSellerPayout,
  PLATFORM_FEE_PERCENT,
} from '../common/platform-fee';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    listing: { include: { seller: { select: { id: true; displayName: true } } } };
    buyer: { select: { id: true; displayName: true } };
    proofFiles: true;
  };
}>;

@Injectable()
export class FulfillmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
    private readonly asaasPayouts: AsaasPayoutsService,
  ) {}

  private get autoCompleteDays(): number {
    return Number(this.config.get<string>('ORDER_AUTO_COMPLETE_DAYS') ?? 7);
  }

  async notifyOrderPurchased(order: { id: number; listingId: number; listing: { title: string; sellerId: string } }) {
    await this.notificationsService.create({
      userId: order.listing.sellerId,
      type: NotificationType.order_purchased,
      title: 'Nova compra!',
      body: `Você vendeu "${order.listing.title}". Inicie o despacho com as provas exigidas.`,
      orderId: order.id,
      listingId: order.listingId,
    });
  }

  private async getOrderForUser(orderId: number, userId: string): Promise<OrderWithRelations> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: { include: { seller: { select: { id: true, displayName: true } } } },
        buyer: { select: { id: true, displayName: true } },
        proofFiles: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Pedido não encontrado' });

    const isBuyer = order.buyerId === userId;
    const isSeller = order.listing.sellerId === userId;
    if (!isBuyer && !isSeller) {
      throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado ao pedido' });
    }

    return order;
  }

  private formatProofFile(file: {
    id: number;
    kind: OrderProofKind;
    storageKey: string;
    mimeType: string;
    createdAt: Date;
  }) {
    const filename = file.storageKey.split('/').pop() ?? '';
    const orderId = Number(file.storageKey.split('/')[1]);
    return {
      id: file.id,
      kind: file.kind,
      url: `/api/media/orders/${orderId}/${filename}`,
      mimeType: file.mimeType,
      createdAt: file.createdAt.toISOString(),
    };
  }

  formatOrderDetail(
    order: OrderWithRelations,
    opts?: { commissionExemptResolved?: boolean; viewerUserId?: string },
  ) {
    const proofs = order.proofFiles.map((file) => this.formatProofFile(file));
    const byKind = (kind: OrderProofKind) => proofs.filter((p) => p.kind === kind);
    const commissionExempt =
      opts?.commissionExemptResolved ??
      (order.status === OrderStatus.completed ? order.commissionExempt : false);

    // Buyer must not receive shipment-proof media URLs (seller/admin still do).
    const hideShipmentMedia =
      opts?.viewerUserId != null &&
      opts.viewerUserId === order.buyerId &&
      opts.viewerUserId !== order.listing.sellerId;

    return {
      id: order.id,
      amount: order.amount,
      paymentType: order.paymentType,
      status: order.status,
      commissionExempt,
      createdAt: order.createdAt.toISOString(),
      completedAt: order.completedAt?.toISOString() ?? null,
      shippedAt: order.shippedAt?.toISOString() ?? null,
      updatedAt: order.updatedAt.toISOString(),
      listing: {
        id: order.listing.id,
        title: order.listing.title,
        priceNum: order.listing.priceNum,
        location: order.listing.location,
        category: order.listing.category,
        imageUrl: order.listing.imageUrls[0] ?? null,
        imageUrls: order.listing.imageUrls,
      },
      buyer: order.buyer,
      seller: order.listing.seller,
      fulfillment: {
        shipmentProof: {
          productPhotos: hideShipmentMedia ? [] : byKind(OrderProofKind.product_photo),
          boxedPhotos: hideShipmentMedia ? [] : byKind(OrderProofKind.boxed_photo),
          packingVideo: hideShipmentMedia
            ? null
            : (byKind(OrderProofKind.packing_video)[0] ?? null),
          submittedAt: order.shippedAt?.toISOString() ?? null,
        },
        receiptProof: {
          unboxingVideo: byKind(OrderProofKind.unboxing_video)[0] ?? null,
          receivedPhotos: byKind(OrderProofKind.received_photo),
          submittedAt:
            byKind(OrderProofKind.unboxing_video).length || byKind(OrderProofKind.received_photo).length
              ? order.proofFiles
                  .filter(
                    (f) =>
                      f.kind === OrderProofKind.unboxing_video ||
                      f.kind === OrderProofKind.received_photo,
                  )
                  .at(-1)
                  ?.createdAt.toISOString() ?? null
              : null,
        },
        buyerDecision:
          order.status === OrderStatus.completed
            ? 'confirm'
            : order.status === OrderStatus.disputed
              ? 'dispute'
              : null,
        disputeReason: order.disputeReason,
        buyerConfirmedAt: order.buyerConfirmedAt?.toISOString() ?? null,
        disputedAt: order.disputedAt?.toISOString() ?? null,
        autoCompleteAt: order.autoCompleteAt?.toISOString() ?? null,
      },
    };
  }

  async countCompletedSales(sellerId: string, excludeOrderId?: number) {
    return this.prisma.order.count({
      where: {
        listing: { sellerId },
        status: OrderStatus.completed,
        ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
      },
    });
  }

  async getSellerCommissionInfo(sellerId: string) {
    const completedSales = await this.countCompletedSales(sellerId);
    return {
      firstSaleExempt: completedSales === 0,
      completedSales,
      commissionPercent: PLATFORM_FEE_PERCENT,
    };
  }

  private async resolveCommissionExemptForDisplay(
    order: OrderWithRelations,
    sellerCompletedCount?: number,
  ) {
    if (order.status === OrderStatus.completed) {
      return order.commissionExempt;
    }
    const count =
      sellerCompletedCount ?? (await this.countCompletedSales(order.listing.sellerId));
    return count === 0;
  }

  private async formatOrderDetailResolved(order: OrderWithRelations, viewerUserId: string) {
    const commissionExempt = await this.resolveCommissionExemptForDisplay(order);
    return this.formatOrderDetail(order, {
      commissionExemptResolved: commissionExempt,
      viewerUserId,
    });
  }

  async getSellerSalesSummary(sellerId: string, periodDays = 30) {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const sellerListingFilter = { listing: { sellerId } };
    const activeScope = buildOrderScopeFilter('active');

    const [
      activeListings,
      totalListings,
      activeOrders,
      completedOrders,
      completedInPeriod,
      cancelledOrders,
      pendingAgg,
      completedAgg,
      completedPeriodAgg,
      recentCompleted,
      periodCompletedOrders,
      allCompletedForPayout,
    ] = await Promise.all([
      this.prisma.listing.count({ where: { sellerId, active: true } }),
      this.prisma.listing.count({ where: { sellerId } }),
      this.prisma.order.count({ where: { ...sellerListingFilter, ...activeScope } }),
      this.prisma.order.count({
        where: { ...sellerListingFilter, status: OrderStatus.completed },
      }),
      this.prisma.order.count({
        where: {
          ...sellerListingFilter,
          status: OrderStatus.completed,
          completedAt: { gte: since },
        },
      }),
      this.prisma.order.count({
        where: {
          ...sellerListingFilter,
          status: { in: [OrderStatus.cancelled, OrderStatus.refunded] },
        },
      }),
      this.prisma.order.aggregate({
        where: { ...sellerListingFilter, ...activeScope },
        _sum: { amount: true },
      }),
      this.prisma.order.aggregate({
        where: { ...sellerListingFilter, status: OrderStatus.completed },
        _sum: { amount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          ...sellerListingFilter,
          status: OrderStatus.completed,
          completedAt: { gte: since },
        },
        _sum: { amount: true },
      }),
      this.prisma.order.findMany({
        where: { ...sellerListingFilter, status: OrderStatus.completed },
        include: {
          listing: { include: { seller: { select: { id: true, displayName: true } } } },
          buyer: { select: { id: true, displayName: true } },
          proofFiles: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      this.prisma.order.findMany({
        where: {
          ...sellerListingFilter,
          status: OrderStatus.completed,
          completedAt: { gte: since },
        },
        select: { amount: true, completedAt: true, commissionExempt: true },
        orderBy: { completedAt: 'asc' },
      }),
      this.prisma.order.findMany({
        where: { ...sellerListingFilter, status: OrderStatus.completed },
        select: { amount: true, commissionExempt: true },
      }),
    ]);

    const gmvCompleted = completedAgg._sum.amount ?? 0;
    const gmvCompletedInPeriod = completedPeriodAgg._sum.amount ?? 0;
    const pendingGmv = pendingAgg._sum.amount ?? 0;

    const byDayMap = new Map<string, { count: number; gmv: number }>();
    for (const order of periodCompletedOrders) {
      const date = (order.completedAt ?? since).toISOString().slice(0, 10);
      const current = byDayMap.get(date) ?? { count: 0, gmv: 0 };
      current.count += 1;
      current.gmv += order.amount;
      byDayMap.set(date, current);
    }

    return {
      periodDays,
      generatedAt: new Date().toISOString(),
      commission: {
        firstSaleExempt: completedOrders === 0,
        commissionPercent: PLATFORM_FEE_PERCENT,
      },
      listings: {
        active: activeListings,
        total: totalListings,
      },
      orders: {
        active: activeOrders,
        completed: completedOrders,
        completedInPeriod,
        cancelled: cancelledOrders,
        pendingGmv,
      },
      revenue: {
        gmvCompleted,
        gmvCompletedInPeriod,
        netPayoutCompleted: calcNetPayoutFromOrders(allCompletedForPayout),
        netPayoutInPeriod: calcNetPayoutFromOrders(periodCompletedOrders),
        averageOrderValue: completedOrders > 0 ? gmvCompleted / completedOrders : 0,
      },
      charts: {
        salesByDay: [...byDayMap.entries()].map(([date, stats]) => ({
          date,
          count: stats.count,
          gmv: stats.gmv,
        })),
      },
      recentCompleted: recentCompleted.map((order) =>
        this.formatOrderDetail(order, {
          commissionExemptResolved: order.commissionExempt,
          viewerUserId: sellerId,
        }),
      ),
    };
  }

  async findSellerOrders(sellerId: string, page = 1, pageSize = 20, scope?: OrderScope) {
    const take = Math.min(Math.max(pageSize, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;
    const scopeFilter = buildOrderScopeFilter(scope);
    const where = { listing: { sellerId }, ...scopeFilter };

    const [orders, total, completedSales] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          listing: { include: { seller: { select: { id: true, displayName: true } } } },
          buyer: { select: { id: true, displayName: true } },
          proofFiles: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
      this.countCompletedSales(sellerId),
    ]);

    return {
      items: orders.map((order) =>
        this.formatOrderDetail(order, {
          commissionExemptResolved:
            order.status === OrderStatus.completed
              ? order.commissionExempt
              : completedSales === 0,
          viewerUserId: sellerId,
        }),
      ),
      page: Math.max(page, 1),
      pageSize: take,
      total,
      commission: {
        firstSaleExempt: completedSales === 0,
        commissionPercent: PLATFORM_FEE_PERCENT,
      },
    };
  }

  async getOrderDetail(orderId: number, userId: string) {
    const order = await this.getOrderForUser(orderId, userId);
    return this.formatOrderDetailResolved(order, userId);
  }

  async startShipment(sellerId: string, orderId: number) {
    const order = await this.getOrderForUser(orderId, sellerId);
    if (order.listing.sellerId !== sellerId) {
      throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
    }
    if (order.status !== OrderStatus.awaiting_shipment) {
      throw new ConflictException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Pedido não está aguardando despacho.',
      });
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.shipment_in_progress },
      include: {
        listing: { include: { seller: { select: { id: true, displayName: true } } } },
        buyer: { select: { id: true, displayName: true } },
        proofFiles: true,
      },
    });

    return this.formatOrderDetailResolved(updated, sellerId);
  }

  async uploadProof(
    userId: string,
    orderId: number,
    kind: OrderProofKind,
    file: Express.Multer.File,
    durationSeconds?: number,
  ) {
    const order = await this.getOrderForUser(orderId, userId);
    const isSeller = order.listing.sellerId === userId;
    const isBuyer = order.buyerId === userId;

    const sellerKinds: OrderProofKind[] = [
      OrderProofKind.product_photo,
      OrderProofKind.boxed_photo,
      OrderProofKind.packing_video,
    ];
    const buyerKinds: OrderProofKind[] = [
      OrderProofKind.unboxing_video,
      OrderProofKind.received_photo,
    ];

    if (sellerKinds.includes(kind) && !isSeller) {
      throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
    }
    if (buyerKinds.includes(kind) && !isBuyer) {
      throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
    }

    if (sellerKinds.includes(kind) && order.status !== OrderStatus.shipment_in_progress) {
      throw new ConflictException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Inicie o despacho antes de enviar provas.',
      });
    }

    if (buyerKinds.includes(kind) && order.status !== OrderStatus.shipped) {
      throw new ConflictException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Aguarde o despacho do vendedor.',
      });
    }

    this.mediaService.validateOrderProofFile(kind, file);
    const saved = await this.mediaService.saveOrderProofFile(orderId, file);

    await this.prisma.orderProofFile.create({
      data: {
        orderId,
        kind,
        storageKey: saved.key,
        mimeType: file.mimetype,
        uploadedById: userId,
        durationSeconds: durationSeconds ?? null,
      },
    });

    return this.getOrderDetail(orderId, userId);
  }

  async deleteProof(userId: string, orderId: number, proofFileId: number) {
    const order = await this.getOrderForUser(orderId, userId);
    const proof = order.proofFiles.find((file) => file.id === proofFileId);
    if (!proof) {
      throw new NotFoundException({ code: 'PROOF_NOT_FOUND', message: 'Prova não encontrada' });
    }

    const isSeller = order.listing.sellerId === userId;
    const isBuyer = order.buyerId === userId;
    const sellerKinds: OrderProofKind[] = [
      OrderProofKind.product_photo,
      OrderProofKind.boxed_photo,
      OrderProofKind.packing_video,
    ];
    const buyerKinds: OrderProofKind[] = [
      OrderProofKind.unboxing_video,
      OrderProofKind.received_photo,
    ];

    if (sellerKinds.includes(proof.kind)) {
      if (!isSeller) {
        throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
      }
      if (order.status !== OrderStatus.shipment_in_progress) {
        throw new ConflictException({
          code: 'INVALID_ORDER_STATUS',
          message: 'Só é possível remover provas antes de submeter o despacho.',
        });
      }
    } else if (buyerKinds.includes(proof.kind)) {
      if (!isBuyer) {
        throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
      }
      if (order.status !== OrderStatus.shipped) {
        throw new ConflictException({
          code: 'INVALID_ORDER_STATUS',
          message: 'Só é possível remover provas antes de confirmar o recebimento.',
        });
      }
    } else {
      throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
    }

    await this.mediaService.deleteOrderProofFile(proof.storageKey);
    await this.prisma.orderProofFile.delete({ where: { id: proofFileId } });

    return this.getOrderDetail(orderId, userId);
  }

  private validateShipmentProofs(proofFiles: { kind: OrderProofKind; durationSeconds: number | null }[]) {
    const hasProduct = proofFiles.some((f) => f.kind === OrderProofKind.product_photo);
    const hasBoxed = proofFiles.some((f) => f.kind === OrderProofKind.boxed_photo);
    const packingVideo = proofFiles.find((f) => f.kind === OrderProofKind.packing_video);

    if (!hasProduct || !hasBoxed || !packingVideo) {
      throw new BadRequestException({
        code: 'SHIPMENT_PROOF_INCOMPLETE',
        message: 'Envie fotos do produto, fotos na caixa e vídeo de embalagem.',
      });
    }
  }

  private validateReceiptProofs(proofFiles: { kind: OrderProofKind; durationSeconds: number | null }[]) {
    const unboxing = proofFiles.find((f) => f.kind === OrderProofKind.unboxing_video);
    const hasPhotos = proofFiles.some((f) => f.kind === OrderProofKind.received_photo);

    if (!unboxing || !hasPhotos) {
      throw new BadRequestException({
        code: 'RECEIPT_PROOF_INCOMPLETE',
        message: 'Envie vídeo de desembalagem e fotos do produto recebido.',
      });
    }
  }

  async submitShipment(sellerId: string, orderId: number) {
    const order = await this.getOrderForUser(orderId, sellerId);
    if (order.listing.sellerId !== sellerId) {
      throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
    }
    if (order.status !== OrderStatus.shipment_in_progress) {
      throw new ConflictException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Pedido não está em despacho.',
      });
    }

    this.validateShipmentProofs(order.proofFiles);

    const shippedAt = new Date();
    const autoCompleteAt = new Date(shippedAt);
    autoCompleteAt.setDate(autoCompleteAt.getDate() + this.autoCompleteDays);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.shipped,
        shippedAt,
        autoCompleteAt,
      },
      include: {
        listing: { include: { seller: { select: { id: true, displayName: true } } } },
        buyer: { select: { id: true, displayName: true } },
        proofFiles: true,
      },
    });

    await this.notificationsService.create({
      userId: updated.buyerId,
      type: NotificationType.order_shipped,
      title: 'Pedido despachado',
      body: `O vendedor despachou "${updated.listing.title}". Registre a desembalagem ao receber.`,
      orderId: updated.id,
      listingId: updated.listingId,
    });

    return this.formatOrderDetailResolved(updated, sellerId);
  }

  async receiptDecision(
    buyerId: string,
    orderId: number,
    decision: 'confirm' | 'dispute',
    reason?: string,
  ) {
    const order = await this.getOrderForUser(orderId, buyerId);
    if (order.buyerId !== buyerId) {
      throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
    }
    if (order.status !== OrderStatus.shipped) {
      throw new ConflictException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Pedido não está aguardando confirmação.',
      });
    }

    this.validateReceiptProofs(order.proofFiles);

    if (decision === 'dispute') {
      if (!reason?.trim()) {
        throw new BadRequestException({
          code: 'DISPUTE_REASON_REQUIRED',
          message: 'Informe o motivo da contestação.',
        });
      }

      const trimmedReason = reason.trim();
      const now = new Date();
      const updated = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.disputed,
          disputedAt: now,
          disputeReason: trimmedReason,
          autoCompleteAt: null,
          dispute: {
            create: {
              status: DisputeStatus.awaiting_admin,
              openedAt: now,
              lastBuyerMessageAt: now,
              messages: {
                create: {
                  authorType: DisputeAuthorType.buyer,
                  authorId: buyerId,
                  body: trimmedReason,
                  createdAt: now,
                },
              },
            },
          },
        },
        include: {
          listing: { include: { seller: { select: { id: true, displayName: true } } } },
          buyer: { select: { id: true, displayName: true } },
          proofFiles: true,
        },
      });

      await this.notificationsService.create({
        userId: updated.listing.sellerId,
        type: NotificationType.order_disputed,
        title: 'Comprador abriu uma disputa',
        body: `O comprador abriu uma disputa sobre "${updated.listing.title}". Vamos analisar o caso e retornaremos com uma resposta em até 48 horas úteis.`,
        orderId: updated.id,
        listingId: updated.listingId,
      });

      return this.formatOrderDetailResolved(updated, buyerId);
    }

    return this.completeOrder(orderId, buyerId);
  }

  /**
   * Conclui o pedido a favor do vendedor: marca como `completed`, avisa as duas partes e libera o
   * escrow. Usado na confirmação de recebimento, em "resolveu meu problema" e na decisão do admin.
   */
  async completeOrder(orderId: number, viewerUserId?: string) {
    const current = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { listing: { select: { sellerId: true } } },
    });
    const priorCompleted = await this.countCompletedSales(current.listing.sellerId);
    const commissionExempt = priorCompleted === 0;

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.completed,
        buyerConfirmedAt: new Date(),
        autoCompleteAt: null,
        completedAt: new Date(),
        commissionExempt,
      },
      include: {
        listing: { include: { seller: { select: { id: true, displayName: true } } } },
        buyer: { select: { id: true, displayName: true } },
        proofFiles: true,
      },
    });

    for (const userId of [updated.buyerId, updated.listing.sellerId]) {
      await this.notificationsService.create({
        userId,
        type: NotificationType.order_completed,
        title: 'Transação concluída',
        body: `O pedido "${updated.listing.title}" foi concluído com sucesso.`,
        orderId: updated.id,
        listingId: updated.listingId,
      });
    }

    await this.releaseEscrowAndCollectCommission(updated);

    return this.formatOrderDetail(updated, {
      commissionExemptResolved: commissionExempt,
      viewerUserId,
    });
  }

  /**
   * O valor cheio da venda fica retido na conta principal da Trade2Fly (nada muda na Asaas até
   * aqui). Na confirmação do comprador, transferimos o valor líquido (já descontada a comissão)
   * para a chave Pix do vendedor — a comissão simplesmente permanece na conta da plataforma, sem
   * precisar de nenhuma transferência adicional. Não bloqueia a confirmação do comprador em caso
   * de falha — o pedido já está `completed`; o escrow fica `held` para retry manual/job se a
   * chamada à Asaas falhar.
   */
  private async releaseEscrowAndCollectCommission(order: {
    id: number;
    amount: number;
    asaasPaymentId: string | null;
    commissionExempt: boolean;
    listing: { sellerId: string };
  }) {
    if (!order.asaasPaymentId) return;

    try {
      const { netPayout } = calculateSellerPayout(order.amount, { commissionExempt: order.commissionExempt });
      const transfer = await this.asaasPayouts.transferToSeller(order.listing.sellerId, netPayout);

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          escrowStatus: 'released',
          escrowReleasedAt: new Date(),
          sellerPayoutTransferId: transfer.id,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[escrow] falha ao transferir o valor líquido do pedido ${order.id} para o vendedor`, error);
    }
  }

  async runAutoCompleteJob() {
    const now = new Date();
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.shipped,
        autoCompleteAt: { lte: now },
      },
      include: {
        listing: { select: { title: true, sellerId: true } },
      },
    });

    for (const order of orders) {
      const priorCompleted = await this.countCompletedSales(order.listing.sellerId);
      const commissionExempt = priorCompleted === 0;
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.completed,
          buyerConfirmedAt: now,
          autoCompleteAt: null,
          completedAt: now,
          commissionExempt,
        },
      });

      await this.releaseEscrowAndCollectCommission({
        id: order.id,
        amount: order.amount,
        asaasPaymentId: order.asaasPaymentId,
        commissionExempt,
        listing: { sellerId: order.listing.sellerId },
      });

      for (const userId of [order.buyerId, order.listing.sellerId]) {
        await this.notificationsService.create({
          userId,
          type: NotificationType.order_auto_completed,
          title: 'Transação concluída automaticamente',
          body: `O pedido "${order.listing.title}" foi concluído após o prazo de ${this.autoCompleteDays} dias.`,
          orderId: order.id,
          listingId: order.listingId,
        });
      }
    }

    return { processed: orders.length };
  }
}
