import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DisputeAuthorType,
  DisputeOutcome,
  DisputeStatus,
  NotificationType,
  OrderStatus,
  Prisma,
  ReturnShippingPayer,
  ReturnStatus,
} from '@prisma/client';
import { paginatedResponse, resolvePagination } from '../admin/dto/admin-pagination.dto';
import { FulfillmentService } from '../fulfillment/fulfillment.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AsaasPaymentsService } from '../payments/asaas/asaas-payments.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminDisputesQueryDto } from './dto/admin-dispute.dto';

const round2 = (value: number) => Math.round(value * 100) / 100;

const disputeInclude = {
  messages: { orderBy: { createdAt: 'asc' } },
  order: {
    include: {
      orderReturn: true,
      buyer: { select: { id: true, displayName: true, email: true } },
      listing: {
        select: {
          id: true,
          title: true,
          imageUrls: true,
          sellerId: true,
          seller: { select: { id: true, displayName: true, email: true } },
        },
      },
    },
  },
} satisfies Prisma.OrderDisputeInclude;

type DisputeWithRelations = Prisma.OrderDisputeGetPayload<{ include: typeof disputeInclude }>;

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly fulfillmentService: FulfillmentService,
    private readonly asaasPayments: AsaasPaymentsService,
  ) {}

  private formatMessages(dispute: DisputeWithRelations) {
    return dispute.messages.map((message) => ({
      id: message.id,
      authorType: message.authorType,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    }));
  }

  private formatReturn(orderReturn: DisputeWithRelations['order']['orderReturn']) {
    if (!orderReturn) return null;
    return {
      status: orderReturn.status,
      shippingPayer: orderReturn.shippingPayer,
      shippingCost: orderReturn.shippingCost,
      refundAmount: orderReturn.refundAmount,
      sellerDebtAmount: orderReturn.sellerDebtAmount,
      trackingCode: orderReturn.trackingCode,
      labelUrl: orderReturn.labelUrl,
      receivedAt: orderReturn.receivedAt?.toISOString() ?? null,
      refundedAt: orderReturn.refundedAt?.toISOString() ?? null,
    };
  }

  private formatDispute(dispute: DisputeWithRelations) {
    return {
      id: dispute.id,
      orderId: dispute.orderId,
      status: dispute.status,
      outcome: dispute.outcome,
      reason: dispute.reason,
      openedAt: dispute.openedAt.toISOString(),
      resolvedAt: dispute.resolvedAt?.toISOString() ?? null,
      messages: this.formatMessages(dispute),
      return: this.formatReturn(dispute.order.orderReturn),
    };
  }

  private async loadByOrderId(orderId: number): Promise<DisputeWithRelations> {
    const dispute = await this.prisma.orderDispute.findUnique({
      where: { orderId },
      include: disputeInclude,
    });
    if (!dispute) {
      throw new NotFoundException({ code: 'DISPUTE_NOT_FOUND', message: 'Disputa não encontrada.' });
    }
    return dispute;
  }

  private async loadForBuyer(orderId: number, buyerId: string) {
    const dispute = await this.loadByOrderId(orderId);
    if (dispute.order.buyerId !== buyerId) {
      throw new ForbiddenException({ code: 'ORDER_FORBIDDEN', message: 'Acesso negado' });
    }
    return dispute;
  }

  // ---------------------------------------------------------------------------
  // Comprador
  // ---------------------------------------------------------------------------

  async getForBuyer(buyerId: string, orderId: number) {
    return this.formatDispute(await this.loadForBuyer(orderId, buyerId));
  }

  /** "Ainda não resolveu": comprador reenvia uma mensagem e a disputa volta para a fila do admin. */
  async buyerReply(buyerId: string, orderId: number, body: string) {
    const dispute = await this.loadForBuyer(orderId, buyerId);
    const now = new Date();

    const claimed = await this.prisma.orderDispute.updateMany({
      where: { id: dispute.id, status: DisputeStatus.awaiting_buyer },
      data: { status: DisputeStatus.awaiting_admin, lastBuyerMessageAt: now },
    });
    if (claimed.count === 0) {
      throw new ConflictException({
        code: 'DISPUTE_NOT_AWAITING_BUYER',
        message: 'Aguarde a resposta da equipe Trade2Fly antes de enviar uma nova mensagem.',
      });
    }

    await this.prisma.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        authorType: DisputeAuthorType.buyer,
        authorId: buyerId,
        body: body.trim(),
        createdAt: now,
      },
    });

    return this.getForBuyer(buyerId, orderId);
  }

  /** "Resolveu meu problema": encerra a disputa e segue o fluxo normal de conclusão do pedido. */
  async buyerConfirmResolved(buyerId: string, orderId: number) {
    const dispute = await this.loadForBuyer(orderId, buyerId);

    const claimed = await this.prisma.orderDispute.updateMany({
      where: { id: dispute.id, status: DisputeStatus.awaiting_buyer },
      data: {
        status: DisputeStatus.resolved,
        outcome: DisputeOutcome.buyer_satisfied,
        resolvedAt: new Date(),
      },
    });
    if (claimed.count === 0) {
      throw new ConflictException({
        code: 'DISPUTE_NOT_AWAITING_BUYER',
        message: 'Esta disputa não está aguardando a sua confirmação.',
      });
    }

    await this.fulfillmentService.completeOrder(orderId, buyerId);
    return this.getForBuyer(buyerId, orderId);
  }

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------

  async adminList(query: AdminDisputesQueryDto) {
    const { page, pageSize, skip } = resolvePagination(query.page, query.pageSize);
    const where: Prisma.OrderDisputeWhereInput =
      !query.status || query.status === 'open'
        ? { status: { in: [DisputeStatus.awaiting_admin, DisputeStatus.awaiting_buyer] } }
        : { status: query.status };

    const [total, rows, pendingAdmin] = await Promise.all([
      this.prisma.orderDispute.count({ where }),
      this.prisma.orderDispute.findMany({
        where,
        skip,
        take: pageSize,
        orderBy:
          query.status === 'resolved'
            ? { resolvedAt: 'desc' }
            : [{ status: 'asc' }, { lastBuyerMessageAt: 'asc' }],
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          _count: { select: { messages: true } },
          order: {
            select: {
              id: true,
              amount: true,
              buyer: { select: { id: true, displayName: true } },
              listing: {
                select: { id: true, title: true, seller: { select: { id: true, displayName: true } } },
              },
            },
          },
        },
      }),
      this.prisma.orderDispute.count({ where: { status: DisputeStatus.awaiting_admin } }),
    ]);

    const items = rows.map((row) => ({
      id: row.id,
      orderId: row.orderId,
      status: row.status,
      outcome: row.outcome,
      reason: row.reason,
      openedAt: row.openedAt.toISOString(),
      lastBuyerMessageAt: row.lastBuyerMessageAt.toISOString(),
      resolvedAt: row.resolvedAt?.toISOString() ?? null,
      messageCount: row._count.messages,
      lastMessage: row.messages[0]
        ? { authorType: row.messages[0].authorType, body: row.messages[0].body }
        : null,
      amount: row.order.amount,
      listingTitle: row.order.listing.title,
      buyer: row.order.buyer,
      seller: row.order.listing.seller,
    }));

    return { ...paginatedResponse(items, total, page, pageSize), pendingAdmin };
  }

  async adminGetByOrder(orderId: number) {
    const dispute = await this.loadByOrderId(orderId);
    return {
      ...this.formatDispute(dispute),
      lastBuyerMessageAt: dispute.lastBuyerMessageAt.toISOString(),
      order: {
        id: dispute.order.id,
        status: dispute.order.status,
        escrowStatus: dispute.order.escrowStatus,
        amount: dispute.order.amount,
        chargeAmount: dispute.order.chargeAmount,
        shippingAmount: dispute.order.shippingAmount,
        shippingInsurance: dispute.order.shippingInsurance,
        deliveryMode: dispute.order.deliveryMode,
        listingTitle: dispute.order.listing.title,
        buyer: dispute.order.buyer,
        seller: dispute.order.listing.seller,
      },
    };
  }

  async adminReply(adminId: string, orderId: number, body: string) {
    const dispute = await this.loadByOrderId(orderId);

    const claimed = await this.prisma.orderDispute.updateMany({
      where: {
        id: dispute.id,
        status: { in: [DisputeStatus.awaiting_admin, DisputeStatus.awaiting_buyer] },
      },
      data: { status: DisputeStatus.awaiting_buyer },
    });
    if (claimed.count === 0) {
      throw new ConflictException({
        code: 'DISPUTE_ALREADY_RESOLVED',
        message: 'Esta disputa já foi encerrada.',
      });
    }

    await this.prisma.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        authorType: DisputeAuthorType.admin,
        authorId: adminId,
        body: body.trim(),
      },
    });

    await this.notificationsService.create({
      userId: dispute.order.buyerId,
      type: NotificationType.dispute_admin_replied,
      title: 'A equipe Trade2Fly respondeu à sua disputa',
      body: `Há uma nova resposta sobre "${dispute.order.listing.title}". Abra o pedido para ver e dizer se o problema foi resolvido.`,
      orderId: dispute.orderId,
      listingId: dispute.order.listingId,
    });

    return this.adminGetByOrder(orderId);
  }

  /** Decisão final do admin: reembolsa o comprador ou libera o valor ao vendedor. */
  async adminResolve(
    adminId: string,
    orderId: number,
    outcome: 'refund_buyer' | 'release_seller' | 'return_and_refund',
    note: string,
    shippingPayerInput?: 'seller' | 'buyer',
  ) {
    const dispute = await this.loadByOrderId(orderId);
    if (dispute.status === DisputeStatus.resolved || dispute.order.status !== OrderStatus.disputed) {
      throw new ConflictException({
        code: 'DISPUTE_ALREADY_RESOLVED',
        message: 'Esta disputa já foi encerrada.',
      });
    }

    if (outcome === 'return_and_refund') {
      return this.approveReturn(adminId, dispute, note, shippingPayerInput);
    }

    if (outcome === 'refund_buyer') {
      const { asaasPaymentId } = dispute.order;
      if (!asaasPaymentId) {
        throw new BadRequestException({
          code: 'ORDER_WITHOUT_ASAAS_PAYMENT',
          message: 'Pedido sem cobrança na Asaas: o reembolso precisa ser feito manualmente.',
        });
      }
      // Se a Asaas falhar, a exceção sobe e nada é alterado: a disputa continua aberta.
      await this.asaasPayments.refundPayment(asaasPaymentId);
    }

    const claimed = await this.prisma.orderDispute.updateMany({
      where: {
        id: dispute.id,
        status: { in: [DisputeStatus.awaiting_admin, DisputeStatus.awaiting_buyer] },
      },
      data: {
        status: DisputeStatus.resolved,
        outcome:
          outcome === 'refund_buyer' ? DisputeOutcome.refund_buyer : DisputeOutcome.release_seller,
        resolvedAt: new Date(),
        resolvedByAdminId: adminId,
      },
    });
    if (claimed.count === 0) {
      throw new ConflictException({
        code: 'DISPUTE_ALREADY_RESOLVED',
        message: 'Esta disputa já foi encerrada.',
      });
    }

    await this.prisma.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        authorType: DisputeAuthorType.admin,
        authorId: adminId,
        body: note.trim(),
      },
    });

    const title = dispute.order.listing.title;
    const { buyerId } = dispute.order;
    const { sellerId } = dispute.order.listing;

    if (outcome === 'refund_buyer') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.refunded, escrowStatus: 'refunded', autoCompleteAt: null },
      });
      await this.notificationsService.create({
        userId: buyerId,
        type: NotificationType.dispute_admin_replied,
        title: 'Disputa resolvida: valor reembolsado',
        body: `Sua disputa sobre "${title}" foi analisada e o valor será reembolsado.`,
        orderId,
        listingId: dispute.order.listingId,
      });
      await this.notificationsService.create({
        userId: sellerId,
        type: NotificationType.order_disputed,
        title: 'Disputa resolvida: pedido reembolsado',
        body: `A disputa sobre "${title}" foi resolvida a favor do comprador e o pedido foi reembolsado.`,
        orderId,
        listingId: dispute.order.listingId,
      });
    } else {
      // Conclui o pedido (notifica as duas partes e libera o escrow ao vendedor).
      await this.fulfillmentService.completeOrder(orderId);
    }

    return this.adminGetByOrder(orderId);
  }

  // ---------------------------------------------------------------------------
  // Devolução (desfecho `return_and_refund`)
  // ---------------------------------------------------------------------------

  /**
   * Aprova a devolução: o produto volta e o reembolso só sai quando o admin confirma o recebimento.
   * O frete de volta é estimado pelo frete de ida (trocado pelo preço real da etiqueta da Loggi depois).
   */
  private async approveReturn(
    adminId: string,
    dispute: DisputeWithRelations,
    note: string,
    shippingPayerInput?: 'seller' | 'buyer',
  ) {
    const { order } = dispute;
    if (!order.asaasPaymentId) {
      throw new BadRequestException({
        code: 'ORDER_WITHOUT_ASAAS_PAYMENT',
        message: 'Pedido sem cobrança na Asaas: o reembolso precisa ser feito manualmente.',
      });
    }

    const shippingPayer: ReturnShippingPayer =
      shippingPayerInput ?? (dispute.reason === 'withdrawal' ? 'buyer' : 'seller');
    const shippingCost = round2(order.shippingAmount);

    // Comprador paga: recebe o preço do produto menos o frete de volta (frete de ida, seguro e juros do cartão não voltam).
    // Vendedor paga: estorno integral; o frete de volta vira débito do vendedor (cobrança em aberto).
    const refundAmount =
      shippingPayer === 'buyer'
        ? round2(order.amount - shippingCost)
        : round2(order.chargeAmount ?? order.amount + order.shippingAmount + order.shippingInsurance);
    if (refundAmount <= 0) {
      throw new BadRequestException({
        code: 'RETURN_REFUND_NOT_POSITIVE',
        message: 'O frete de volta é maior que o valor do produto. Revise quem arca com o frete.',
      });
    }

    const claimed = await this.prisma.orderDispute.updateMany({
      where: {
        id: dispute.id,
        status: { in: [DisputeStatus.awaiting_admin, DisputeStatus.awaiting_buyer] },
      },
      data: {
        status: DisputeStatus.resolved,
        outcome: DisputeOutcome.return_and_refund,
        resolvedAt: new Date(),
        resolvedByAdminId: adminId,
      },
    });
    if (claimed.count === 0) {
      throw new ConflictException({
        code: 'DISPUTE_ALREADY_RESOLVED',
        message: 'Esta disputa já foi encerrada.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.orderReturn.create({
        data: {
          orderId: order.id,
          shippingPayer,
          shippingCost,
          refundAmount,
          sellerDebtAmount: shippingPayer === 'seller' ? shippingCost : 0,
          approvedByAdminId: adminId,
        },
      }),
      this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.return_in_progress, autoCompleteAt: null },
      }),
      this.prisma.disputeMessage.create({
        data: {
          disputeId: dispute.id,
          authorType: DisputeAuthorType.admin,
          authorId: adminId,
          body: note.trim(),
        },
      }),
    ]);

    const title = order.listing.title;
    const payerText =
      shippingPayer === 'buyer'
        ? 'O frete de volta será descontado do reembolso.'
        : 'O frete de volta fica por conta do vendedor.';
    await this.notificationsService.create({
      userId: order.buyerId,
      type: NotificationType.return_approved,
      title: 'Devolução aprovada',
      body: `Sua disputa sobre "${title}" foi aprovada: devolva o produto com a etiqueta que enviaremos. ${payerText}`,
      orderId: order.id,
      listingId: order.listingId,
    });
    await this.notificationsService.create({
      userId: order.listing.sellerId,
      type: NotificationType.return_approved,
      title: 'Devolução aprovada',
      body: `A disputa sobre "${title}" foi resolvida com devolução do produto. ${payerText}`,
      orderId: order.id,
      listingId: order.listingId,
    });

    return this.adminGetByOrder(order.id);
  }

  private async loadReturn(orderId: number) {
    const orderReturn = await this.prisma.orderReturn.findUnique({ where: { orderId } });
    if (!orderReturn) {
      throw new NotFoundException({ code: 'RETURN_NOT_FOUND', message: 'Devolução não encontrada.' });
    }
    return orderReturn;
  }

  /** Registra rastreio/etiqueta da devolução (manual até a integração com a Loggi gerar a etiqueta reversa). */
  async adminSetReturnLabel(orderId: number, trackingCode?: string, labelUrl?: string) {
    const code = trackingCode?.trim();
    const url = labelUrl?.trim();
    if (!code && !url) {
      throw new BadRequestException({
        code: 'RETURN_LABEL_REQUIRED',
        message: 'Informe o código de rastreio ou o link da etiqueta.',
      });
    }
    const orderReturn = await this.loadReturn(orderId);
    if (
      orderReturn.status !== ReturnStatus.awaiting_label &&
      orderReturn.status !== ReturnStatus.label_issued
    ) {
      throw new ConflictException({
        code: 'INVALID_RETURN_STATUS',
        message: 'A etiqueta só pode ser registrada antes do envio do produto.',
      });
    }
    await this.prisma.orderReturn.update({
      where: { orderId },
      data: {
        status: ReturnStatus.label_issued,
        trackingCode: code || orderReturn.trackingCode,
        labelUrl: url || orderReturn.labelUrl,
      },
    });
    return this.adminGetByOrder(orderId);
  }

  async adminMarkReturnInTransit(orderId: number) {
    const claimed = await this.prisma.orderReturn.updateMany({
      where: { orderId, status: ReturnStatus.label_issued },
      data: { status: ReturnStatus.in_transit, shippedAt: new Date() },
    });
    if (claimed.count === 0) {
      throw new ConflictException({
        code: 'INVALID_RETURN_STATUS',
        message: 'Registre a etiqueta antes de marcar o produto como em trânsito.',
      });
    }
    return this.adminGetByOrder(orderId);
  }

  /** Produto devolvido chegou ao vendedor: estorna na Asaas (total ou parcial) e encerra o pedido como reembolsado. */
  async adminConfirmReturnReceived(orderId: number) {
    const orderReturn = await this.loadReturn(orderId);
    const previous = orderReturn.status;
    if (previous !== ReturnStatus.label_issued && previous !== ReturnStatus.in_transit) {
      throw new ConflictException({
        code: 'INVALID_RETURN_STATUS',
        message: 'Registre a etiqueta da devolução antes de confirmar o recebimento.',
      });
    }

    // Claim atômico: evita duplo estorno se dois admins confirmarem ao mesmo tempo.
    const claimed = await this.prisma.orderReturn.updateMany({
      where: { orderId, status: previous },
      data: { status: ReturnStatus.received, receivedAt: new Date() },
    });
    if (claimed.count === 0) {
      throw new ConflictException({
        code: 'INVALID_RETURN_STATUS',
        message: 'O recebimento desta devolução já foi confirmado.',
      });
    }

    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { listing: { select: { title: true, sellerId: true } } },
    });

    try {
      await this.asaasPayments.refundPayment(
        order.asaasPaymentId!,
        orderReturn.shippingPayer === 'buyer' ? orderReturn.refundAmount : undefined,
      );
    } catch (error) {
      // Se a Asaas falhar, volta o status anterior para o admin tentar de novo.
      await this.prisma.orderReturn.update({
        where: { orderId },
        data: { status: previous, receivedAt: null },
      });
      throw error;
    }

    await this.prisma.$transaction([
      this.prisma.orderReturn.update({
        where: { orderId },
        data: { status: ReturnStatus.refunded, refundedAt: new Date() },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.refunded, escrowStatus: 'refunded' },
      }),
    ]);

    const title = order.listing.title;
    await this.notificationsService.create({
      userId: order.buyerId,
      type: NotificationType.return_received,
      title: 'Devolução recebida: valor reembolsado',
      body: `Recebemos a devolução de "${title}". O reembolso de R$ ${orderReturn.refundAmount.toFixed(2).replace('.', ',')} foi solicitado.`,
      orderId,
      listingId: order.listingId,
    });
    await this.notificationsService.create({
      userId: order.listing.sellerId,
      type: NotificationType.return_received,
      title: 'Devolução concluída',
      body: `A devolução de "${title}" foi concluída e o pedido foi reembolsado.`,
      orderId,
      listingId: order.listingId,
    });

    return this.adminGetByOrder(orderId);
  }
}
