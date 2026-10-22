import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';

type SendMessagePayload = {
  threadId: number;
  text: string;
};

type JoinThreadPayload = {
  threadId: number;
};

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = await this.authenticateClient(client);
    if (!userId) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Token inválido ou ausente' });
      client.disconnect(true);
      return;
    }

    client.data.userId = userId;
    await client.join(`user:${userId}`);
    this.logger.debug(`Client connected: user:${userId}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.logger.debug(`Client disconnected: user:${userId}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Não autenticado' });
      return;
    }

    const text = payload?.text?.trim();
    const threadId = Number(payload?.threadId);
    if (!threadId || !text) {
      client.emit('error', { code: 'BAD_REQUEST', message: 'threadId e text são obrigatórios' });
      return;
    }

    try {
      await this.messagesService.sendToThread(userId, threadId, text);
    } catch (error) {
      const err = error as { status?: number; message?: string };
      const code = err.status === 404 ? 'FORBIDDEN' : 'ERROR';
      client.emit('error', { code, message: err.message ?? 'Falha ao enviar mensagem' });
    }
  }

  @SubscribeMessage('joinThread')
  async handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinThreadPayload,
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Não autenticado' });
      return;
    }

    const threadId = Number(payload?.threadId);
    if (!threadId) return;

    const thread = await this.prisma.chatThread.findFirst({
      where: { id: threadId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    });
    if (!thread) {
      client.emit('error', { code: 'FORBIDDEN', message: 'Conversa não encontrada' });
      return;
    }

    await client.join(`thread:${threadId}`);
  }

  broadcastNewMessage(
    thread: { id: number; buyerId: string; sellerId: string },
    message: ReturnType<MessagesService['formatMessage']>,
  ) {
    const payload = { threadId: thread.id, message };
    this.server.to(`user:${thread.buyerId}`).emit('messageCreated', payload);
    this.server.to(`user:${thread.sellerId}`).emit('messageCreated', payload);
    this.server.to(`thread:${thread.id}`).emit('messageCreated', payload);

    const threadUpdated = {
      threadId: thread.id,
      lastMessage: { text: message.text, createdAt: message.createdAt },
      updatedAt: message.createdAt,
    };
    this.server.to(`user:${thread.buyerId}`).emit('threadUpdated', threadUpdated);
    this.server.to(`user:${thread.sellerId}`).emit('threadUpdated', threadUpdated);
  }

  broadcastNotification(
    userId: string,
    notification: Record<string, unknown>,
    unreadCount: number,
  ) {
    this.server.to(`user:${userId}`).emit('notification:new', { notification });
    this.server.to(`user:${userId}`).emit('notification:unread', { unreadCount });
  }

  broadcastUnreadCount(userId: string, unreadCount: number) {
    this.server.to(`user:${userId}`).emit('notification:unread', { unreadCount });
  }

  broadcastCheckoutUnlocked(payload: {
    listingId: number;
    threadId: number;
    buyerId: string;
    agreedPrice: number;
    expiresAt: string;
  }) {
    const event = {
      listingId: payload.listingId,
      threadId: payload.threadId,
      agreedPrice: payload.agreedPrice,
      expiresAt: payload.expiresAt,
    };
    this.server.to(`user:${payload.buyerId}`).emit('checkoutUnlocked', event);
  }

  broadcastCheckoutExpired(payload: {
    listingId: number;
    threadId: number;
    buyerId: string;
  }) {
    const event = {
      listingId: payload.listingId,
      threadId: payload.threadId,
    };
    this.server.to(`user:${payload.buyerId}`).emit('checkoutExpired', event);
  }

  broadcastListingSaleModeChanged(payload: { listingId: number; saleMode: string }) {
    void this.notifyListingParticipants(payload.listingId, 'listingSaleModeChanged', payload);
  }

  private async notifyListingParticipants(
    listingId: number,
    event: string,
    payload: Record<string, unknown>,
  ) {
    const threads = await this.prisma.chatThread.findMany({
      where: { listingId },
      select: { buyerId: true, sellerId: true },
    });

    const userIds = new Set<string>();
    for (const thread of threads) {
      userIds.add(thread.buyerId);
      userIds.add(thread.sellerId);
    }

    for (const userId of userIds) {
      this.server.to(`user:${userId}`).emit(event, payload);
    }
  }

  private async authenticateClient(client: Socket): Promise<string | null> {
    const rawToken =
      client.handshake.auth?.token ??
      (typeof client.handshake.headers.authorization === 'string'
        ? client.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
        : null);

    if (!rawToken) return null;

    try {
      const payload = this.jwtService.verify<{ sub: string }>(rawToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.active) return null;
      return user.id;
    } catch {
      return null;
    }
  }
}
