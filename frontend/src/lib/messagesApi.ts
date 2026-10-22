import { apiGet, apiPost } from './api';
import type { ChatMessage, ChatThread, SendMessageResponse } from '../types/chat';

export function getThreads(): Promise<ChatThread[]> {
  return apiGet<ChatThread[]>('/api/messages');
}

export function markThreadRead(threadId: number): Promise<{ ok: boolean }> {
  return apiPost<{ ok: boolean }>(`/api/messages/${threadId}/read`, {});
}

export function getMessages(threadId: number): Promise<ChatMessage[]> {
  return apiGet<ChatMessage[]>(`/api/messages/${threadId}`);
}

export function sendMessage(listingId: number, text: string): Promise<SendMessageResponse> {
  return apiPost<SendMessageResponse>('/api/messages', { listingId, text });
}

export function replyToThread(threadId: number, text: string): Promise<ChatMessage> {
  return apiPost<ChatMessage>(`/api/messages/${threadId}`, { text });
}
