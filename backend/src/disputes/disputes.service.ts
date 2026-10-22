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
} from '@prisma/client';
import { paginatedResponse, resolvePagination } from '../admin/dto/admin-pagination.dto';
import { FulfillmentService } from '../fulfillment/fulfillment.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AsaasPaymentsService } from '../payments/asaas/asaas-payments.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminDisputesQueryDto } from './dto/admin-dispute.dto';

const disputeInclude = {
  messages: { orderBy: { createdAt: 'asc' } },
  order: {
    include: {
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

  private formatDispute(dispute: DisputeWithRelations) {
    return {
      id: dispute.id,
      orderId: dispute.orderId,
      status: dispute.status,
      outcome: dispute.outcome,
      openedAt: dispute.openedAt.toISOString(),
      resolvedAt: dispute.resolvedAt?.toISOString() ?? null,
      messages: this.formatMessages(dispute),
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
    outcome: 'refund_buyer' | 'release_seller',
    note: string,
  ) {
    const dispute = await this.loadByOrderId(orderId);
    if (dispute.status === DisputeStatus.resolved || dispute.order.status !== OrderStatus.disputed) {
      throw new ConflictException({
        code: 'DISPUTE_ALREADY_RESOLVED',
        message: 'Esta disputa já foi encerrada.',
      });
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
}
