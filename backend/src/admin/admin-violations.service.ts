import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminViolationsQueryDto } from './dto/admin-violations-query.dto';
import { paginatedResponse, resolvePagination } from './dto/admin-pagination.dto';

@Injectable()
export class AdminViolationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminViolationsQueryDto) {
    const { page, pageSize, skip } = resolvePagination(query.page, query.pageSize);
    const where: Prisma.CheckoutViolationWhereInput = {};

    if (query.userId) where.userId = query.userId;
    if (query.listingId) where.listingId = Number(query.listingId);

    const [total, violations] = await Promise.all([
      this.prisma.checkoutViolation.count({ where }),
      this.prisma.checkoutViolation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          listing: { select: { title: true } },
        },
      }),
    ]);

    const items = violations.map((violation) => ({
      id: violation.id,
      userId: violation.userId,
      userEmail: violation.user.email,
      listingId: violation.listingId,
      listingTitle: violation.listing.title,
      attemptedAmount: violation.attemptedAmount,
      agreedPrice: violation.agreedPrice,
      createdAt: violation.createdAt.toISOString(),
    }));

    return paginatedResponse(items, total, page, pageSize);
  }
}
