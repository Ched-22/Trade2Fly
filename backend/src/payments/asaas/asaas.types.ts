export type AsaasBillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

export interface AsaasCreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface AsaasCreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export interface AsaasPayment {
  id: string;
  status: string;
  billingType: AsaasBillingType;
  value: number;
  invoiceUrl: string;
  bankSlipUrl?: string | null;
  installmentCount?: number | null;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasTransfer {
  id: string;
  status: string;
  value: number;
}
