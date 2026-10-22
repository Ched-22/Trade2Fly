import { apiPost } from './api';

export type SupportChatRole = 'user' | 'assistant';

export type SupportChatTurn = {
  role: SupportChatRole;
  content: string;
};

export type SupportChatResponse = {
  reply: string;
  escalate: { reason: string; email: string } | null;
};

export function sendSupportChatMessage(
  message: string,
  history: SupportChatTurn[],
): Promise<SupportChatResponse> {
  return apiPost<SupportChatResponse>('/api/support-chat/message', { message, history });
}
