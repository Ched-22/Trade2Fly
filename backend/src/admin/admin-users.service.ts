import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  loadAutoCompletedOrderIds,
  mapOrderToListItem,
  orderListInclude,
} from './admin-order.helpers';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { paginatedResponse, resolvePagination } from './dto/admin-pagination.dto';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminUsersQueryDto) {
    const { page, pageSize, skip } = resolvePagination(query.page, query.pageSize);
    const where: Prisma.UserWhereInput = {};

    if (query.q?.trim()) {
      const term = query.q.trim();
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { displayName: { contains: term, mode: 'insensitive' } },
      ];
    }
    if (query.active === 'true') where.active = true;
    if (query.active === 'false') where.active = false;

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              listings: true,
              orders: true,
              checkoutViolations: true,
            },
          },
        },
      }),
    ]);

    const items = users.map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      active: user.active,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      listingsCount: user._count.listings,
      ordersCount: user._count.orders,
      violationsCount: user._count.checkoutViolations,
    }));

    return paginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            checkoutViolations: true,
            buyerThreads: true,
            sellerThreads: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const [
      buyerOrdersTotal,
      buyerOrdersCompleted,
      buyerSpentAgg,
      listingsTotal,
      listingsActive,
      salesTotal,
      salesCompleted,
      salesGmvAgg,
      recentBuyerOrders,
      recentSellerSales,
      recentListings,
      recentViolations,
    ] = await Promise.all([
      this.prisma.order.count({ where: { buyerId: id } }),
      this.prisma.order.count({ where: { buyerId: id, status: OrderStatus.completed } }),
      this.prisma.order.aggregate({
        where: { buyerId: id, status: OrderStatus.completed },
        _sum: { amount: true },
      }),
      this.prisma.listing.count({ where: { sellerId: id } }),
      this.prisma.listing.count({ where: { sellerId: id, active: true } }),
      this.prisma.order.count({ where: { listing: { sellerId: id } } }),
      this.prisma.order.count({
        where: { listing: { sellerId: id }, status: OrderStatus.completed },
      }),
      this.prisma.order.aggregate({
        where: { listing: { sellerId: id }, status: OrderStatus.completed },
        _sum: { amount: true },
      }),
      this.prisma.order.findMany({
        where: { buyerId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: orderListInclude,
      }),
      this.prisma.order.findMany({
        where: { listing: { sellerId: id } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: orderListInclude,
      }),
      this.prisma.listing.findMany({
        where: { sellerId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, priceNum: true, active: true, createdAt: true },
      }),
      this.prisma.checkoutViolation.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const recentOrderIds = [...recentBuyerOrders, ...recentSellerSales].map((order) => order.id);
    const autoCompletedIds = await loadAutoCompletedOrderIds(this.prisma, recentOrderIds);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        initials: user.initials,
        active: user.active,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      buyerProfile: {
        stats: {
          ordersTotal: buyerOrdersTotal,
          ordersCompleted: buyerOrdersCompleted,
          totalSpent: buyerSpentAgg._sum.amount ?? 0,
        },
        recentOrders: recentBuyerOrders.map((order) =>
          mapOrderToListItem(order, autoCompletedIds),
        ),
      },
      sellerProfile: {
        stats: {
          listingsTotal,
          listingsActive,
          salesTotal,
          salesCompleted,
          gmvCompleted: salesGmvAgg._sum.amount ?? 0,
        },
        recentListings: recentListings.map((listing) => ({
          ...listing,
          createdAt: listing.createdAt.toISOString(),
        })),
        recentSales: recentSellerSales.map((order) =>
          mapOrderToListItem(order, autoCompletedIds),
        ),
      },
      recentViolations: recentViolations.map((violation) => ({
        ...violation,
        createdAt: violation.createdAt.toISOString(),
      })),
    };
  }

  async updateActive(adminId: string, id: string, dto: AdminUpdateUserDto) {
    if (adminId === id && dto.active === false) {
      throw new BadRequestException('Você não pode desativar sua própria conta admin.');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { active: dto.active },
    });

    this.logger.log(`Admin ${adminId} set user ${id} active=${dto.active}`);

    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      active: updated.active,
      role: updated.role,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
