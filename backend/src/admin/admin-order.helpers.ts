import { NotificationType, OrderStatus, Prisma } from '@prisma/client';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';

export type CompletionSource = 'buyer_confirmed' | 'auto_completed' | null;

export const orderListInclude = {
  buyer: { select: { id: true, email: true, displayName: true } },
  listing: {
    select: {
      id: true,
      title: true,
      sellerId: true,
      seller: { select: { id: true, email: true, displayName: true } },
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderListRow = Prisma.OrderGetPayload<{ include: typeof orderListInclude }>;

export function buildOrdersWhere(query: AdminOrdersQueryDto): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (query.completedOnly) {
    where.status = OrderStatus.completed;
  } else if (query.status) {
    where.status = query.status;
  }

  if (query.buyerId) where.buyerId = query.buyerId;
  if (query.listingId) where.listingId = Number(query.listingId);
  if (query.sellerId) {
    where.listing = { sellerId: query.sellerId };
  }

  if (query.q?.trim()) {
    const term = query.q.trim();
    where.OR = [
      { listing: { title: { contains: term, mode: 'insensitive' } } },
      { buyer: { email: { contains: term, mode: 'insensitive' } } },
      { buyer: { displayName: { contains: term, mode: 'insensitive' } } },
      { listing: { seller: { email: { contains: term, mode: 'insensitive' } } } },
      { listing: { seller: { displayName: { contains: term, mode: 'insensitive' } } } },
    ];
  }

  return where;
}

export function resolveCompletionSource(
  status: OrderStatus,
  orderId: number,
  autoCompletedIds: Set<number>,
): CompletionSource {
  if (status !== OrderStatus.completed) return null;
  return autoCompletedIds.has(orderId) ? 'auto_completed' : 'buyer_confirmed';
}

export async function loadAutoCompletedOrderIds(
  prisma: { notification: { findMany: (args: unknown) => Promise<{ orderId: number | null }[]> } },
  orderIds: number[],
): Promise<Set<number>> {
  if (orderIds.length === 0) return new Set();

  const notifications = await prisma.notification.findMany({
    where: {
      orderId: { in: orderIds },
      type: NotificationType.order_auto_completed,
    },
    select: { orderId: true },
  });

  return new Set(
    notifications.map((row) => row.orderId).filter((id): id is number => id != null),
  );
}

export function mapOrderToListItem(order: OrderListRow, autoCompletedIds: Set<number>) {
  return {
    id: order.id,
    listingId: order.listingId,
    listingTitle: order.listing.title,
    buyerId: order.buyerId,
    buyerEmail: order.buyer.email,
    buyerDisplayName: order.buyer.displayName,
    sellerId: order.listing.sellerId,
    sellerEmail: order.listing.seller.email,
    sellerDisplayName: order.listing.seller.displayName,
    amount: order.amount,
    paymentType: order.paymentType,
    status: order.status,
    disputedAt: order.disputedAt?.toISOString() ?? null,
    disputeReason: order.disputeReason,
    createdAt: order.createdAt.toISOString(),
    completedAt: order.completedAt?.toISOString() ?? null,
    completionSource: resolveCompletionSource(order.status, order.id, autoCompletedIds),
  };
}

export function escapeCsvValue(value: string | number | null | undefined): string {
  if (value == null) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildOrdersCsv(rows: ReturnType<typeof mapOrderToListItem>[]): string {
  const header = [
    'orderId',
    'listingId',
    'listingTitle',
    'buyerEmail',
    'buyerDisplayName',
    'sellerEmail',
    'sellerDisplayName',
    'amount',
    'paymentType',
    'status',
    'completionSource',
    'createdAt',
    'completedAt',
  ];

  const lines = rows.map((row) =>
    [
      row.id,
      row.listingId,
      row.listingTitle,
      row.buyerEmail,
      row.buyerDisplayName,
      row.sellerEmail,
      row.sellerDisplayName,
      row.amount,
      row.paymentType,
      row.status,
      row.completionSource ?? '',
      row.createdAt,
      row.completedAt ?? '',
    ]
      .map(escapeCsvValue)
      .join(','),
  );

  return `\uFEFF${header.join(',')}\n${lines.join('\n')}`;
}
