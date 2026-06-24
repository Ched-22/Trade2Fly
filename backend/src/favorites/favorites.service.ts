import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: { seller: { select: { id: true, displayName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites
      .filter((f) => f.listing.active)
      .map((f) => ({
        id: f.id,
        listingId: f.listingId,
        createdAt: f.createdAt,
        listing: {
          id: f.listing.id,
          title: f.listing.title,
          priceNum: f.listing.priceNum,
          specs: f.listing.specs,
          category: f.listing.category,
          condition: f.listing.condition,
          location: f.listing.location,
          escrow: f.listing.escrow,
          sellerName: f.listing.seller.displayName,
        },
      }));
  }

  async toggle(userId: string, listingId: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, listingId } });
    return { favorited: true };
  }

  async getFavoriteIds(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });
    return favorites.map((f) => f.listingId);
  }
}
