import { apiPost } from './api';
import type { ChatMessage } from '../types/chat';

export type CreateOfferResponse = {
  threadId: number;
  message: ChatMessage;
  saleMode: 'direct' | 'offersOnly';
};

export type OfferResponseAction = 'accept' | 'decline' | 'counter';

export type RespondOfferResponse = {
  threadId: number;
  message: ChatMessage;
  action: OfferResponseAction;
  agreedPrice?: number;
  saleMode?: 'direct' | 'offersOnly';
};

export function createOffer(
  listingId: number,
  offerAmount: number,
  text?: string,
): Promise<CreateOfferResponse> {
  return apiPost<CreateOfferResponse>(`/api/listings/${listingId}/offers`, {
    offerAmount,
    text: text || undefined,
  });
}

export function respondToOffer(
  listingId: number,
  payload: {
    threadId: number;
    offerMessageId: number;
    action: OfferResponseAction;
    offerAmount?: number;
    text?: string;
    sellerAcknowledgedWarning?: boolean;
  },
): Promise<RespondOfferResponse> {
  return apiPost<RespondOfferResponse>(`/api/listings/${listingId}/offer-responses`, payload);
}
