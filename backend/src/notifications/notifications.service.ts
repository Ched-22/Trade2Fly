import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  orderId?: number;
  listingId?: number;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  formatNotification(row: {
    id: number;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    orderId: number | null;
    listingId: number | null;
    createdAt: Date;
  }) {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      read: row.read,
      orderId: row.orderId,
      listingId: row.listingId,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        orderId: input.orderId,
        listingId: input.listingId,
      },
    });

    const unreadCount = await this.getUnreadCount(input.userId);
    this.chatGateway.broadcastNotification(
      input.userId,
      this.formatNotification(notification),
      unreadCount,
    );

    return notification;
  }

  async findAll(userId: string, page = 1, pageSize = 20, unreadOnly = false) {
    const take = Math.min(Math.max(pageSize, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
      this.getUnreadCount(userId),
    ]);

    return {
      items: items.map((item) => this.formatNotification(item)),
      page: Math.max(page, 1),
      pageSize: take,
      total,
      unreadCount,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  async markRead(userId: string, id: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) return null;

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    const unreadCount = await this.getUnreadCount(userId);
    this.chatGateway.broadcastUnreadCount(userId, unreadCount);

    return this.formatNotification(updated);
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    this.chatGateway.broadcastUnreadCount(userId, 0);
    return { unreadCount: 0 };
  }
}
