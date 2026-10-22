import { apiDelete, apiGet, apiPatch, apiPost } from './api';

export type CardPaymentMethod = {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string | null;
  isDefault: boolean;
  createdAt: string;
};

export type PixPaymentMethod = {
  id: string;
  type: 'pix';
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixKeyMasked: string;
  holderName: string | null;
  isDefault: boolean;
  createdAt: string;
};

export type PaymentMethod = CardPaymentMethod | PixPaymentMethod;

export type SetupIntentResponse = {
  provider: 'stripe' | 'mock';
  clientSecret: string;
  publishableKey: string | null;
};

export type PaymentConfigResponse = {
  enabled: boolean;
  gatewayMode: 'mock' | 'stripe';
};

export function getPaymentConfig(): Promise<PaymentConfigResponse> {
  return apiGet<PaymentConfigResponse>('/api/payment-methods/config');
}

export function getPaymentMethods(): Promise<PaymentMethod[]> {
  return apiGet<PaymentMethod[]>('/api/payment-methods');
}

export function createSetupIntent(): Promise<SetupIntentResponse> {
  return apiPost<SetupIntentResponse>('/api/payment-methods/setup-intent', { type: 'card' });
}

export function createCardPaymentMethod(payload: {
  gatewayToken: string;
  setAsDefault?: boolean;
}): Promise<PaymentMethod> {
  return apiPost<PaymentMethod>('/api/payment-methods', {
    type: 'card',
    gatewayToken: payload.gatewayToken,
    setAsDefault: payload.setAsDefault,
  });
}

export function createPixPaymentMethod(payload: {
  pixKey: string;
  pixKeyType: PixPaymentMethod['pixKeyType'];
  holderName?: string;
  setAsDefault?: boolean;
}): Promise<PaymentMethod> {
  return apiPost<PaymentMethod>('/api/payment-methods', {
    type: 'pix',
    ...payload,
  });
}

export function setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
  return apiPatch<PaymentMethod>(`/api/payment-methods/${id}/default`, {});
}

export function deletePaymentMethod(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/payment-methods/${id}`);
}

export const PIX_KEY_TYPE_LABELS: Record<PixPaymentMethod['pixKeyType'], string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave aleatória',
};

export const CARD_BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'Amex',
};
