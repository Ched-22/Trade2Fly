import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilterListingDto } from './dto/filter-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FilterListingDto) {
    const where: any = { active: true };

    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { brand: { contains: filters.q, mode: 'insensitive' } },
        { category: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    if (filters.category) where.category = filters.category;
    if (filters.brand) where.brand = filters.brand;
    if (filters.condition) where.condition = filters.condition;
    if (filters.escrow === true) where.escrow = true;
    if (filters.min !== undefined || filters.max !== undefined) {
      where.priceNum = {};
      if (filters.min !== undefined) where.priceNum.gte = filters.min;
      if (filters.max !== undefined) where.priceNum.lte = filters.max;
    }

    const orderBy: any =
      filters.sort === 'menor'
        ? { priceNum: 'asc' }
        : filters.sort === 'maior'
          ? { priceNum: 'desc' }
          : { createdAt: 'desc' };

    const listings = await this.prisma.listing.findMany({
      where,
      orderBy,
      include: { seller: { select: { id: true, displayName: true, initials: true } } },
    });

    return listings.map((l) => this.formatListing(l));
  }

  async findOne(id: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: { id: true, displayName: true, initials: true } } },
    });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');
    return this.formatListing(listing);
  }

  async create(sellerId: string, dto: CreateListingDto) {
    const listing = await this.prisma.listing.create({
      data: { ...dto, sellerId },
      include: { seller: { select: { id: true, displayName: true, initials: true } } },
    });
    return this.formatListing(listing);
  }

  async update(id: number, userId: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Anúncio não encontrado');
    if (listing.sellerId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.listing.update({
      where: { id },
      data: dto,
      include: { seller: { select: { id: true, displayName: true, initials: true } } },
    });
    return this.formatListing(updated);
  }

  async remove(id: number, userId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Anúncio não encontrado');
    if (listing.sellerId !== userId) throw new ForbiddenException();

    await this.prisma.listing.update({ where: { id }, data: { active: false } });
    return { message: 'Anúncio removido com sucesso' };
  }

  async findBySeller(sellerId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { sellerId, active: true },
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { id: true, displayName: true, initials: true } } },
    });
    return listings.map((l) => this.formatListing(l));
  }

  private formatListing(listing: any) {
    return {
      id: listing.id,
      title: listing.title,
      priceNum: listing.priceNum,
      specs: listing.specs,
      size: listing.size,
      jumps: listing.jumps,
      year: listing.year,
      weight: listing.weight,
      brand: listing.brand,
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      escrow: listing.escrow,
      description: listing.description,
      sellerId: listing.sellerId,
      sellerName: listing.seller?.displayName ?? '',
      createdAt: listing.createdAt,
    };
  }
}
