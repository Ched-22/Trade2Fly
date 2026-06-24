import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateOrderDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id: dto.listingId } });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');
    if (listing.sellerId === buyerId) throw new BadRequestException('Você não pode comprar seu próprio anúncio');

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        listingId: dto.listingId,
        amount: listing.priceNum,
        paymentType: dto.paymentType,
      },
      include: {
        listing: { select: { id: true, title: true, priceNum: true, location: true } },
      },
    });

    return order;
  }

  async findAll(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: {
        listing: {
          select: { id: true, title: true, priceNum: true, location: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, buyerId: userId },
      include: {
        listing: { include: { seller: { select: { id: true, displayName: true } } } },
      },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }
}
