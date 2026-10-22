export type SetupIntentResult = {
  provider: 'stripe' | 'mock';
  clientSecret: string;
  publishableKey: string | null;
};

export type AttachedCardDetails = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string | null;
  gatewayPaymentMethodId: string;
  gatewayCustomerId: string | null;
};

export interface PaymentGateway {
  createSetupIntent(userId: string, email: string): Promise<SetupIntentResult>;
  attachCard(userId: string, email: string, gatewayToken: string): Promise<AttachedCardDetails>;
  detachCard(gatewayPaymentMethodId: string, gatewayCustomerId?: string | null): Promise<void>;
}
