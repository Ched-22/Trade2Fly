import { Injectable } from '@nestjs/common';
import { ListingSaleMode, MessageType, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function dayKeys(periodDays: number): string[] {
  const keys: string[] = [];
  for (let index = periodDays - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    keys.push(date.toISOString().slice(0, 10));
  }
  return keys;
}

function countByDay<T extends { createdAt: Date }>(rows: T[], keys: string[]): { date: string; count: number }[] {
  const map = new Map(keys.map((key) => [key, 0]));
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return keys.map((date) => ({ date, count: map.get(date) ?? 0 }));
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(periodDays: number) {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);
    const todayStart = startOfToday();
    const keys = dayKeys(periodDays);

    const [
      usersTotal,
      usersActive,
      usersInactive,
      usersNewInPeriod,
      usersNewToday,
      listingsTotal,
      listingsActive,
      listingsInactive,
      listingsOffersOnly,
      listingsDirect,
      listingsNewInPeriod,
      ordersTotal,
      ordersPending,
      ordersCompleted,
      ordersInPeriod,
      allOrders,
      threadsTotal,
      messagesTotal,
      messagesInPeriod,
      offersInPeriod,
      violationsTotal,
      violationsInPeriod,
      violationsUsers,
      recentUsers,
      recentOrders,
      recentViolations,
      recentListings,
      usersInPeriod,
      ordersForChart,
      listingsByCategory,
      ordersByPayment,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { active: true } }),
      this.prisma.user.count({ where: { active: false } }),
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { active: true } }),
      this.prisma.listing.count({ where: { active: false } }),
      this.prisma.listing.count({ where: { saleMode: ListingSaleMode.offersOnly } }),
      this.prisma.listing.count({ where: { saleMode: ListingSaleMode.direct } }),
      this.prisma.listing.count({ where: { createdAt: { gte: since } } }),
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { status: { notIn: [OrderStatus.completed, OrderStatus.cancelled, OrderStatus.refunded] } },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.completed } }),
      this.prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { amount: true } }),
      this.prisma.order.findMany({ select: { amount: true } }),
      this.prisma.chatThread.count(),
      this.prisma.message.count(),
      this.prisma.message.count({ where: { createdAt: { gte: since } } }),
      this.prisma.message.count({
        where: { createdAt: { gte: since }, messageType: MessageType.offer },
      }),
      this.prisma.checkoutViolation.count(),
      this.prisma.checkoutViolation.count({ where: { createdAt: { gte: since } } }),
      this.prisma.checkoutViolation.groupBy({
        by: ['userId'],
        _count: { userId: true },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, email: true, displayName: true, createdAt: true },
      }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          buyer: { select: { email: true } },
          listing: { select: { title: true } },
        },
      }),
      this.prisma.checkoutViolation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.listing.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { seller: { select: { email: true } } },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, amount: true, paymentType: true },
      }),
      this.prisma.listing.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 8,
      }),
      this.prisma.order.groupBy({
        by: ['paymentType'],
        _count: { paymentType: true },
      }),
    ]);

    const gmvTotal = allOrders.reduce((sum, order) => sum + order.amount, 0);
    const gmvInPeriod = ordersInPeriod.reduce((sum, order) => sum + order.amount, 0);
    const averageOrderValue = ordersTotal > 0 ? gmvTotal / ordersTotal : 0;

    const signupsByDay = countByDay(usersInPeriod, keys);
    const ordersByDayMap = new Map(keys.map((key) => [key, { count: 0, gmv: 0 }]));
    for (const order of ordersForChart) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const bucket = ordersByDayMap.get(key);
      if (bucket) {
        bucket.count += 1;
        bucket.gmv += order.amount;
      }
    }
    const ordersByDay = keys.map((date) => ({
      date,
      count: ordersByDayMap.get(date)?.count ?? 0,
      gmv: ordersByDayMap.get(date)?.gmv ?? 0,
    }));

    return {
      generatedAt: new Date().toISOString(),
      periodDays,
      users: {
        total: usersTotal,
        active: usersActive,
        inactive: usersInactive,
        newInPeriod: usersNewInPeriod,
        newToday: usersNewToday,
      },
      listings: {
        total: listingsTotal,
        active: listingsActive,
        inactive: listingsInactive,
        offersOnly: listingsOffersOnly,
        direct: listingsDirect,
        newInPeriod: listingsNewInPeriod,
      },
      orders: {
        total: ordersTotal,
        pending: ordersPending,
        completed: ordersCompleted,
        gmvTotal,
        gmvInPeriod,
        averageOrderValue,
      },
      chat: {
        threadsTotal,
        messagesTotal,
        messagesInPeriod,
        offersInPeriod,
      },
      violations: {
        total: violationsTotal,
        inPeriod: violationsInPeriod,
        uniqueUsers: violationsUsers.length,
      },
      charts: {
        signupsByDay,
        ordersByDay,
        listingsByCategory: listingsByCategory.map((row) => ({
          category: row.category,
          count: row._count.category,
        })),
        ordersByPaymentType: ordersByPayment.map((row) => ({
          paymentType: row.paymentType,
          count: row._count.paymentType,
        })),
      },
      recentActivity: {
        recentUsers: recentUsers.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          listingTitle: order.listing.title,
          buyerEmail: order.buyer.email,
          amount: order.amount,
          createdAt: order.createdAt.toISOString(),
        })),
        recentViolations: recentViolations.map((violation) => ({
          id: violation.id,
          userId: violation.userId,
          listingId: violation.listingId,
          attemptedAmount: violation.attemptedAmount,
          agreedPrice: violation.agreedPrice,
          createdAt: violation.createdAt.toISOString(),
        })),
        recentListings: recentListings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          sellerEmail: listing.seller.email,
          priceNum: listing.priceNum,
          createdAt: listing.createdAt.toISOString(),
        })),
      },
    };
  }
}
