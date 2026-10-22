import type { ChatMessage } from '../types/chat';

const NEGOTIATION_TYPES = new Set(['offer', 'offer_accepted', 'offer_declined']);

function findLatestNegotiationMessage(messages: ChatMessage[]): ChatMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.messageType && NEGOTIATION_TYPES.has(message.messageType)) {
      return message;
    }
  }
  return null;
}

/** Latest offer awaiting a response from `userId` (sent by the other party). */
export function findPendingOfferForUser(
  messages: ChatMessage[],
  userId: string | undefined,
): ChatMessage | null {
  if (!userId) return null;
  const latest = findLatestNegotiationMessage(messages);
  if (!latest || latest.messageType !== 'offer') return null;
  if (latest.senderId === userId) return null;
  return latest;
}

export function isOfferPendingForUser(
  messages: ChatMessage[],
  offerMessageId: number,
  userId: string | undefined,
): boolean {
  const pending = findPendingOfferForUser(messages, userId);
  return pending?.id === offerMessageId;
}

/** True when this offer is the open proposal and `userId` is waiting for the other party. */
export function isOfferAwaitingCounterpart(
  messages: ChatMessage[],
  offerMessageId: number,
  userId: string | undefined,
): boolean {
  if (!userId) return false;
  const latest = findLatestNegotiationMessage(messages);
  return (
    latest?.id === offerMessageId &&
    latest.messageType === 'offer' &&
    latest.senderId === userId
  );
}
