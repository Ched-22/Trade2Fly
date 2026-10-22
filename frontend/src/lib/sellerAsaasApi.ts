import { apiGet, apiPost } from './api';

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export interface SetPayoutPixKeyPayload {
  pixKeyType: PixKeyType;
  pixKey: string;
}

export interface PayoutStatusResponse {
  hasPixKey: boolean;
  pixKeyType: PixKeyType | null;
  pixKeyMasked: string | null;
}

export function setPayoutPixKey(payload: SetPayoutPixKeyPayload) {
  return apiPost<{ pixKeyType: PixKeyType; pixKeyMasked: string }>('/api/sellers/payout-pix-key', payload);
}

export function getPayoutStatus() {
  return apiGet<PayoutStatusResponse>('/api/sellers/payout-pix-key/status');
}
