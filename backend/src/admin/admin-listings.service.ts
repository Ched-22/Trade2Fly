import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ListingSaleMode, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminListingsQueryDto } from './dto/admin-listings-query.dto';
import { AdminUpdateListingDto } from './dto/admin-update-listing.dto';
import { paginatedResponse, resolvePagination } from './dto/admin-pagination.dto';

@Injectable()
export class AdminListingsService {
  private readonly logger = new Logger(AdminListingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminListingsQueryDto) {
    const { page, pageSize, skip } = resolvePagination(query.page, query.pageSize);
    const where: Prisma.ListingWhereInput = {};

    if (query.q?.trim()) {
      where.title = { contains: query.q.trim(), mode: 'insensitive' };
    }
    if (query.active === 'true') where.active = true;
    if (query.active === 'false') where.active = false;
    if (query.saleMode === 'direct' || query.saleMode === 'offersOnly') {
      where.saleMode = query.saleMode as ListingSaleMode;
    }
    if (query.category) where.category = query.category;

    const [total, listings] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { seller: { select: { email: true } } },
      }),
    ]);

    const items = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      priceNum: listing.priceNum,
      category: listing.category,
      saleMode: listing.saleMode,
      active: listing.active,
      sellerId: listing.sellerId,
      sellerEmail: listing.seller.email,
      createdAt: listing.createdAt.toISOString(),
    }));

    return paginatedResponse(items, total, page, pageSize);
  }

  async updateActive(adminId: string, id: number, dto: AdminUpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Anúncio não encontrado');

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { active: dto.active },
    });

    this.logger.log(
      `Admin ${adminId} set listing ${id} active=${dto.active}`,
    );

    return {
      id: updated.id,
      title: updated.title,
      active: updated.active,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
