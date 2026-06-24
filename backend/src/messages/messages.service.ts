import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getThreads(userId: string) {
    const threads = await this.prisma.chatThread.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        buyer: { select: { id: true, displayName: true } },
        seller: { select: { id: true, displayName: true } },
        listing: { select: { id: true, title: true, priceNum: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return threads.map((t) => {
      const otherUser = t.buyerId === userId ? t.seller : t.buyer;
      const lastMsg = t.messages[0];
      return {
        id: t.id,
        otherUser: { id: otherUser.id, name: otherUser.displayName },
        listing: { id: t.listing.id, title: t.listing.title, priceNum: t.listing.priceNum },
        lastMessage: lastMsg ? { text: lastMsg.text, createdAt: lastMsg.createdAt } : null,
        createdAt: t.createdAt,
      };
    });
  }

  async getMessages(userId: string, threadId: number) {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id: threadId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    });
    if (!thread) throw new NotFoundException('Conversa não encontrada');

    return this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, displayName: true } } },
    });
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id: dto.listingId } });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');

    let thread = await this.prisma.chatThread.findUnique({
      where: { buyerId_listingId: { buyerId: userId, listingId: dto.listingId } },
    });

    if (!thread) {
      thread = await this.prisma.chatThread.create({
        data: { buyerId: userId, sellerId: listing.sellerId, listingId: dto.listingId },
      });
    }

    const message = await this.prisma.message.create({
      data: { threadId: thread.id, senderId: userId, text: dto.text },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    return { threadId: thread.id, message };
  }

  async sendToThread(userId: string, threadId: number, text: string) {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id: threadId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    });
    if (!thread) throw new NotFoundException('Conversa não encontrada');

    return this.prisma.message.create({
      data: { threadId, senderId: userId, text },
      include: { sender: { select: { id: true, displayName: true } } },
    });
  }
}
