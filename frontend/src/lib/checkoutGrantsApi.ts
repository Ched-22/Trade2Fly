import { apiGet, apiPost } from './api';

export type CheckoutGrant = {
  id: number;
  listingId: number;
  threadId: number;
  buyerId: string;
  sellerId: string;
  agreedPrice: number;
  status: string;
  expiresAt: string;
  createdAt: string;
};

export function createCheckoutGrant(
  listingId: number,
  payload: {
    threadId: number;
    agreedPrice: number;
    sellerAcknowledgedWarning: boolean;
  },
): Promise<CheckoutGrant> {
  return apiPost<CheckoutGrant>(`/api/listings/${listingId}/checkout-grants`, payload);
}

export function getSuggestedPrice(threadId: number): Promise<{ suggestedPrice: number | null }> {
  return apiGet<{ suggestedPrice: number | null }>(`/api/messages/${threadId}/suggested-price`);
}
