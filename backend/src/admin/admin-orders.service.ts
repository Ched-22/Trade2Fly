import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderProofKind, OrderStatus, Prisma } from '@prisma/client';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildOrdersCsv,
  buildOrdersWhere,
  loadAutoCompletedOrderIds,
  mapOrderToListItem,
  orderListInclude,
  resolveCompletionSource,
} from './admin-order.helpers';
import { AdminCompletedSummaryQueryDto } from './dto/admin-completed-summary-query.dto';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';
import { AdminUserOrdersQueryDto } from './dto/admin-user-orders-query.dto';
import { paginatedResponse, resolvePagination } from './dto/admin-pagination.dto';

const EXPORT_MAX_ROWS = 5000;

type ProofFileRow = {
  id: number;
  kind: OrderProofKind;
  storageKey: string;
  mimeType: string;
  createdAt: Date;
};

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private formatProofFile(orderId: number, file: ProofFileRow) {
    const filename = file.storageKey.split('/').pop() ?? '';
    return {
      id: file.id,
      kind: file.kind,
      mimeType: file.mimeType,
      url: `/api/media/orders/${orderId}/${filename}`,
      createdAt: file.createdAt.toISOString(),
    };
  }

  private groupFulfillmentProofs(orderId: number, proofFiles: ProofFileRow[], shippedAt: Date | null) {
    const formatted = proofFiles.map((file) => this.formatProofFile(orderId, file));
    const byKind = (kind: OrderProofKind) => formatted.filter((file) => file.kind === kind);
    const receiptFiles = proofFiles.filter(
      (file) =>
        file.kind === OrderProofKind.unboxing_video || file.kind === OrderProofKind.received_photo,
    );

    return {
      shipmentProof: {
        productPhotos: byKind(OrderProofKind.product_photo),
        boxedPhotos: byKind(OrderProofKind.boxed_photo),
        packingVideo: byKind(OrderProofKind.packing_video)[0] ?? null,
        submittedAt: shippedAt?.toISOString() ?? null,
      },
      receiptProof: {
        unboxingVideo: byKind(OrderProofKind.unboxing_video)[0] ?? null,
        receivedPhotos: byKind(OrderProofKind.received_photo),
        submittedAt: receiptFiles.at(-1)?.createdAt.toISOString() ?? null,
      },
    };
  }

  async findAll(query: AdminOrdersQueryDto) {
    const { page, pageSize, skip } = resolvePagination(query.page, query.pageSize);
    const where = buildOrdersWhere(query);
    const orderBy: Prisma.OrderOrderByWithRelationInput =
      query.status === OrderStatus.disputed
        ? { disputedAt: 'desc' }
        : { createdAt: 'desc' };

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: orderListInclude,
      }),
    ]);

    const autoCompletedIds = await loadAutoCompletedOrderIds(
      this.prisma,
      orders.map((order) => order.id),
    );
    const items = orders.map((order) => mapOrderToListItem(order, autoCompletedIds));

    return paginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, email: true, displayName: true, active: true } },
        listing: {
          select: {
            id: true,
            title: true,
            priceNum: true,
            imageUrls: true,
            sellerId: true,
            seller: { select: { id: true, email: true, displayName: true } },
          },
        },
        proofFiles: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const autoCompletedIds = await loadAutoCompletedOrderIds(this.prisma, [order.id]);
    const completionSource = resolveCompletionSource(order.status, order.id, autoCompletedIds);
    const proofFiles = order.proofFiles.map((file) => this.formatProofFile(order.id, file));
    const fulfillment = this.groupFulfillmentProofs(order.id, order.proofFiles, order.shippedAt);

    return {
      order: {
        id: order.id,
        buyerId: order.buyerId,
        listingId: order.listingId,
        amount: order.amount,
        paymentType: order.paymentType,
        status: order.status,
        shippedAt: order.shippedAt?.toISOString() ?? null,
        buyerConfirmedAt: order.buyerConfirmedAt?.toISOString() ?? null,
        disputedAt: order.disputedAt?.toISOString() ?? null,
        disputeReason: order.disputeReason,
        autoCompleteAt: order.autoCompleteAt?.toISOString() ?? null,
        completedAt: order.completedAt?.toISOString() ?? null,
        completionSource,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
      buyer: order.buyer,
      listing: {
        id: order.listing.id,
        title: order.listing.title,
        priceNum: order.listing.priceNum,
        imageUrl: order.listing.imageUrls[0] ?? null,
        publicPath: `/anuncio/${order.listing.id}`,
        sellerId: order.listing.sellerId,
        sellerEmail: order.listing.seller.email,
        sellerDisplayName: order.listing.seller.displayName,
      },
      fulfillment,
      proofFiles,
    };
  }

  async getCompletedSummary(query: AdminCompletedSummaryQueryDto) {
    const periodDays = query.periodDays ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const where: Prisma.OrderWhereInput = {
      status: OrderStatus.completed,
      completedAt: { gte: since },
    };
    if (query.sellerId) {
      where.listing = { sellerId: query.sellerId };
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: { amount: true, completedAt: true },
      orderBy: { completedAt: 'asc' },
    });

    const completedCount = orders.length;
    const gmvCompleted = orders.reduce((sum, order) => sum + order.amount, 0);
    const averageOrderValue = completedCount > 0 ? gmvCompleted / completedCount : 0;

    const byDayMap = new Map<string, { count: number; gmv: number }>();
    for (const order of orders) {
      const date = (order.completedAt ?? since).toISOString().slice(0, 10);
      const current = byDayMap.get(date) ?? { count: 0, gmv: 0 };
      current.count += 1;
      current.gmv += order.amount;
      byDayMap.set(date, current);
    }

    const byDay = [...byDayMap.entries()].map(([date, stats]) => ({
      date,
      count: stats.count,
      gmv: stats.gmv,
    }));

    return {
      periodDays,
      completedCount,
      gmvCompleted,
      averageOrderValue,
      byDay,
    };
  }

  async exportCsv(query: AdminOrdersQueryDto, res: Response) {
    const where = buildOrdersWhere(query);
    const total = await this.prisma.order.count({ where });

    if (total > EXPORT_MAX_ROWS) {
      throw new BadRequestException(
        `Exportação limitada a ${EXPORT_MAX_ROWS} linhas. Refine os filtros (${total} pedidos encontrados).`,
      );
    }

    const orders = await this.prisma.order.findMany({
      where,
      take: EXPORT_MAX_ROWS,
      orderBy: { createdAt: 'desc' },
      include: orderListInclude,
    });

    const autoCompletedIds = await loadAutoCompletedOrderIds(
      this.prisma,
      orders.map((order) => order.id),
    );
    const items = orders.map((order) => mapOrderToListItem(order, autoCompletedIds));
    const csv = buildOrdersCsv(items);
    const filename = `trade2fly-pedidos-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  async findForUser(userId: string, query: AdminUserOrdersQueryDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const where: Prisma.OrderWhereInput =
      query.role === 'buyer' ? { buyerId: userId } : { listing: { sellerId: userId } };

    if (query.status) where.status = query.status;

    const { page, pageSize, skip } = resolvePagination(query.page, query.pageSize);

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: orderListInclude,
      }),
    ]);

    const autoCompletedIds = await loadAutoCompletedOrderIds(
      this.prisma,
      orders.map((order) => order.id),
    );
    const items = orders.map((order) => mapOrderToListItem(order, autoCompletedIds));

    return paginatedResponse(items, total, page, pageSize);
  }
}
