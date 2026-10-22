import { io, type Socket } from 'socket.io-client';
import type {
  CheckoutExpiredEvent,
  CheckoutUnlockedEvent,
  ListingSaleModeChangedEvent,
  MessageCreatedEvent,
  ThreadUpdatedEvent,
} from '../types/chat';
import type { Notification } from '../lib/notificationsApi';

export type ChatSocketHandlers = {
  onMessageCreated: (event: MessageCreatedEvent) => void;
  onThreadUpdated: (event: ThreadUpdatedEvent) => void;
  onCheckoutUnlocked?: (event: CheckoutUnlockedEvent) => void;
  onCheckoutExpired?: (event: CheckoutExpiredEvent) => void;
  onListingSaleModeChanged?: (event: ListingSaleModeChangedEvent) => void;
  onNotificationNew?: (event: { notification: Notification }) => void;
  onNotificationUnread?: (event: { unreadCount: number }) => void;
  onError?: (error: { code: string; message: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

let socket: Socket | null = null;

function resolveSocketUrl(): string {
  const wsUrl = import.meta.env.VITE_WS_URL?.trim();
  if (wsUrl) return `${wsUrl.replace(/\/$/, '')}/chat`;
  return '/chat';
}

function resolveSocketPath(): string {
  return import.meta.env.VITE_WS_PATH?.trim() || '/socket.io';
}

export function connectChatSocket(token: string, handlers: ChatSocketHandlers): Socket {
  disconnectChatSocket();

  socket = io(resolveSocketUrl(), {
    path: resolveSocketPath(),
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => handlers.onConnect?.());
  socket.on('disconnect', () => handlers.onDisconnect?.());
  socket.on('connect_error', () => {
    handlers.onError?.({ code: 'CONNECT_ERROR', message: 'Não foi possível conectar ao chat.' });
  });
  socket.on('messageCreated', handlers.onMessageCreated);
  socket.on('threadUpdated', handlers.onThreadUpdated);
  socket.on('checkoutUnlocked', (event: CheckoutUnlockedEvent) => handlers.onCheckoutUnlocked?.(event));
  socket.on('checkoutExpired', (event: CheckoutExpiredEvent) => handlers.onCheckoutExpired?.(event));
  socket.on('listingSaleModeChanged', (event: ListingSaleModeChangedEvent) =>
    handlers.onListingSaleModeChanged?.(event),
  );
  socket.on('notification:new', (event: { notification: Notification }) =>
    handlers.onNotificationNew?.(event),
  );
  socket.on('notification:unread', (event: { unreadCount: number }) =>
    handlers.onNotificationUnread?.(event),
  );
  socket.on('error', (error: { code: string; message: string }) => handlers.onError?.(error));

  return socket;
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function emitSendMessage(threadId: number, text: string): void {
  socket?.emit('sendMessage', { threadId, text });
}

export function emitJoinThread(threadId: number): void {
  socket?.emit('joinThread', { threadId });
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export function getChatSocket(): Socket | null {
  return socket;
}
