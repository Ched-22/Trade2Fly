import { apiPost } from './api';

export type ShippingQuote = {
  amount: number;
  provider: string;
  source: 'loggi' | 'estimate';
  estimatedDays: number | null;
  freightTypeLabel: string | null;
  weightKg: number;
};

export function fetchShippingQuote(params: {
  listingId: number;
  destinationCep: string;
  destinationCity?: string;
  destinationState?: string;
}): Promise<ShippingQuote> {
  return apiPost<ShippingQuote>('/api/shipping/quote', params);
}
