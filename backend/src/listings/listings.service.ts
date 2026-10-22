import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CheckoutGrantStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutGrantsService } from '../checkout-grants/checkout-grants.service';
import { MediaService } from '../media/media.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilterListingDto } from './dto/filter-listing.dto';
import { CURRENT_SELLER_TERMS_VERSION } from '../legal/legal.constants';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
    private readonly checkoutGrantsService: CheckoutGrantsService,
  ) {}

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

  async findOne(id: number, userId?: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: { id: true, displayName: true, initials: true } } },
    });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');

    let checkoutGrant: {
      canCheckout: boolean;
      agreedPrice: number;
      threadId: number;
      expiresAt: string;
      expired: boolean;
    } | null = null;

    if (userId) {
      const grant = await this.checkoutGrantsService.findValidActiveGrant(id, userId);
      if (grant) {
        checkoutGrant = this.checkoutGrantsService.formatCheckoutAccess(grant);
      } else {
        const expiredGrant = await this.prisma.checkoutGrant.findFirst({
          where: {
            listingId: id,
            buyerId: userId,
            status: CheckoutGrantStatus.expired,
          },
          orderBy: { expiresAt: 'desc' },
        });
        if (expiredGrant) {
          checkoutGrant = this.checkoutGrantsService.formatExpiredCheckoutAccess(expiredGrant);
        }
      }
    }

    return {
      ...this.formatListing(listing),
      checkoutGrant,
    };
  }

  async create(sellerId: string, dto: CreateListingDto) {
    const { acceptedSellerTerms: _acceptedSellerTerms, ...listingData } = dto;
    const listing = await this.prisma.listing.create({
      data: {
        ...listingData,
        sellerId,
        active: true,
        escrow: true,
        sellerTermsAcceptedAt: new Date(),
        sellerTermsVersion: CURRENT_SELLER_TERMS_VERSION,
      },
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

  async findBySeller(sellerId: string, activeFilter: 'true' | 'false' | 'all' = 'true') {
    const activeOrderFilter = {
      status: { notIn: [OrderStatus.completed, OrderStatus.cancelled, OrderStatus.refunded] },
    };

    let where: Record<string, unknown> = { sellerId };
    if (activeFilter === 'true') {
      where = {
        sellerId,
        OR: [{ active: true }, { orders: { some: activeOrderFilter } }],
      };
    } else if (activeFilter === 'false') {
      where = {
        sellerId,
        active: false,
        NOT: { orders: { some: activeOrderFilter } },
      };
    }

    const listings = await this.prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, displayName: true, initials: true } },
        orders: {
          where: activeOrderFilter,
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, status: true },
        },
      },
    });
    return listings.map((l) => this.formatListing(l));
  }

  async uploadPhotos(id: number, userId: string, files: Express.Multer.File[]) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Anúncio não encontrado');
    if (listing.sellerId !== userId) throw new ForbiddenException();

    const imageUrls = await this.mediaService.replaceListingPhotos(id, files);
    const updated = await this.prisma.listing.update({
      where: { id },
      data: { imageUrls },
      include: { seller: { select: { id: true, displayName: true, initials: true } } },
    });
    return this.formatListing(updated);
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
      postalCode: listing.postalCode ?? null,
      escrow: listing.escrow,
      description: listing.description,
      imageUrls: listing.imageUrls ?? [],
      saleMode: listing.saleMode ?? 'direct',
      sellerId: listing.sellerId,
      sellerName: listing.seller?.displayName ?? '',
      active: listing.active ?? true,
      activeOrder: listing.orders?.[0]
        ? { id: listing.orders[0].id, status: listing.orders[0].status }
        : null,
      createdAt: listing.createdAt?.toISOString?.() ?? listing.createdAt,
    };
  }
}
