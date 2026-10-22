import { OrderStatus, Prisma } from '@prisma/client';

export type OrderScope = 'active' | 'history' | 'all';

export function buildOrderScopeFilter(scope?: OrderScope): Prisma.OrderWhereInput | undefined {
  if (scope === 'active') {
    return {
      status: { notIn: [OrderStatus.completed, OrderStatus.cancelled, OrderStatus.refunded] },
    };
  }
  if (scope === 'history') {
    return {
      status: { in: [OrderStatus.completed, OrderStatus.cancelled, OrderStatus.refunded] },
    };
  }
  return undefined;
}
