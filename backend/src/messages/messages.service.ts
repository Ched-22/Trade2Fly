import { ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CheckoutGrantStatus, ListingSaleMode, MessageType, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
import { SendMessageDto } from './dto/send-message.dto';

type MessageWithSender = {
  id: number;
  threadId: number;
  senderId: string;
  text: string;
  messageType?: MessageType;
  offerAmount?: number | null;
  createdAt: Date;
  sender: { id: string; displayName: string };
};

type ThreadWithLastMessage = {
  id: number;
  buyerId: string;
  sellerId: string;
  messages: { senderId: string; createdAt: Date }[];
  reads: { readAt: Date }[];
};

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  formatMessage(message: MessageWithSender) {
    return {
      id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      text: message.text,
      messageType: message.messageType ?? MessageType.text,
      offerAmount: message.offerAmount ?? null,
      createdAt: message.createdAt.toISOString(),
      sender: message.sender,
    };
  }

  private isThreadUnreadForUser(thread: ThreadWithLastMessage, userId: string): boolean {
    const lastMsg = thread.messages[0];
    if (!lastMsg || lastMsg.senderId === userId) return false;

    const read = thread.reads[0];
    if (!read) return true;

    return lastMsg.createdAt > read.readAt;
  }

  async markThreadAsRead(userId: string, threadId: number, readAt?: Date) {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id: threadId, OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!thread) return;

    const resolvedReadAt = readAt ?? thread.messages[0]?.createdAt ?? new Date();

    await this.prisma.chatThreadRead.upsert({
      where: { userId_threadId: { userId, threadId } },
      create: { userId, threadId, readAt: resolvedReadAt },
      update: { readAt: resolvedReadAt },
    });
  }

  async getUnreadThreadCount(userId: string): Promise<number> {
    const threads = await this.prisma.chatThread.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { senderId: true, createdAt: true } },
        reads: { where: { userId }, take: 1, select: { readAt: true } },
      },
    });

    return threads.filter((thread) => this.isThreadUnreadForUser(thread, userId)).length;
  }

  async getThreads(userId: string) {
    const threads = await this.prisma.chatThread.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        buyer: { select: { id: true, displayName: true } },
        seller: { select: { id: true, displayName: true } },
        listing: { select: { id: true, title: true, priceNum: true, saleMode: true, active: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        reads: { where: { userId }, take: 1, select: { readAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const listingIds = [...new Set(threads.map((thread) => thread.listing.id))];
    const threadIds = threads.map((thread) => thread.id);

    const [listingsWithCompletedOrders, threadsWithOffers, activeCheckoutGrants] = await Promise.all([
      listingIds.length === 0
        ? Promise.resolve([])
        : this.prisma.order.findMany({
            where: {
              listingId: { in: listingIds },
              status: OrderStatus.completed,
            },
            select: { listingId: true },
            distinct: ['listingId'],
          }),
      threadIds.length === 0
        ? Promise.resolve([])
        : this.prisma.message.findMany({
            where: { threadId: { in: threadIds }, messageType: MessageType.offer },
            select: { threadId: true },
            distinct: ['threadId'],
          }),
      threadIds.length === 0
        ? Promise.resolve([])
        : this.prisma.checkoutGrant.findMany({
            where: {
              buyerId: userId,
              threadId: { in: threadIds },
              status: CheckoutGrantStatus.active,
              expiresAt: { gt: new Date() },
            },
            select: { threadId: true, agreedPrice: true, expiresAt: true },
          }),
    ]);

    const listingIdsCompleted = new Set(listingsWithCompletedOrders.map((order) => order.listingId));
    const threadIdsWithOffers = new Set(threadsWithOffers.map((message) => message.threadId));
    const checkoutGrantByThread = new Map(
      activeCheckoutGrants.map((grant) => [grant.threadId, grant]),
    );

    return threads.map((t) => {
      const otherUser = t.buyerId === userId ? t.seller : t.buyer;
      const lastMsg = t.messages[0];
      const isSeller = t.sellerId === userId;
      const hasOfferInThread = threadIdsWithOffers.has(t.id);
      const canReleaseCheckout =
        isSeller &&
        t.listing.active &&
        !listingIdsCompleted.has(t.listing.id) &&
        hasOfferInThread;

      const checkoutGrant = checkoutGrantByThread.get(t.id);
      const canCompletePurchase =
        !isSeller &&
        t.listing.active &&
        !listingIdsCompleted.has(t.listing.id) &&
        checkoutGrant != null;

      return {
        id: t.id,
        otherUser: { id: otherUser.id, name: otherUser.displayName },
        listing: {
          id: t.listing.id,
          title: t.listing.title,
          priceNum: t.listing.priceNum,
          saleMode: t.listing.saleMode,
          active: t.listing.active,
        },
        lastMessage: lastMsg
          ? { text: lastMsg.text, createdAt: lastMsg.createdAt.toISOString() }
          : null,
        createdAt: t.createdAt.toISOString(),
        unread: this.isThreadUnreadForUser(t, userId),
        isSeller,
        canReleaseCheckout,
        canCompletePurchase,
        checkoutAgreedPrice: canCompletePurchase ? checkoutGrant.agreedPrice : undefined,
        checkoutExpiresAt: canCompletePurchase
          ? checkoutGrant.expiresAt.toISOString()
          : undefined,
      };
    });
  }

  async getMessages(userId: string, threadId: number) {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id: threadId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    });
    if (!thread) throw new NotFoundException('Conversa não encontrada');

    const messages = await this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    await this.markThreadAsRead(userId, threadId);

    return messages.map((message) => this.formatMessage(message));
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

    const formatted = this.formatMessage(message);
    await this.markThreadAsRead(userId, thread.id, message.createdAt);
    this.chatGateway.broadcastNewMessage(thread, formatted);

    return { threadId: thread.id, message: formatted };
  }

  async sendToThread(userId: string, threadId: number, text: string) {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id: threadId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    });
    if (!thread) throw new NotFoundException('Conversa não encontrada');

    const message = await this.prisma.message.create({
      data: { threadId, senderId: userId, text },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    const formatted = this.formatMessage(message);
    await this.markThreadAsRead(userId, threadId, message.createdAt);
    this.chatGateway.broadcastNewMessage(thread, formatted);
    return formatted;
  }

  async getSuggestedPrice(sellerId: string, threadId: number) {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id: threadId, sellerId },
    });
    if (!thread) throw new ForbiddenException();

    const lastOffer = await this.prisma.message.findFirst({
      where: { threadId, messageType: MessageType.offer, offerAmount: { not: null } },
      orderBy: { createdAt: 'desc' },
    });

    return { suggestedPrice: lastOffer?.offerAmount ?? null };
  }
}
