import { randomBytes } from 'crypto';
import type {
  AttachedCardDetails,
  PaymentGateway,
  SetupIntentResult,
} from './payment-gateway.interface';

const MOCK_BRANDS = ['visa', 'mastercard', 'elo'] as const;

export class MockGatewayAdapter implements PaymentGateway {
  async createSetupIntent(_userId: string, _email: string): Promise<SetupIntentResult> {
    return {
      provider: 'mock',
      clientSecret: `mock_secret_${randomBytes(8).toString('hex')}`,
      publishableKey: null,
    };
  }

  async attachCard(_userId: string, _email: string, gatewayToken: string): Promise<AttachedCardDetails> {
    if (!gatewayToken.startsWith('mock_pm_')) {
      throw new Error('Invalid mock payment token');
    }
    const suffix = gatewayToken.replace('mock_pm_', '').slice(-4).padStart(4, '0');
    const brand = MOCK_BRANDS[suffix.charCodeAt(0) % MOCK_BRANDS.length];
    return {
      brand,
      last4: suffix,
      expMonth: 12,
      expYear: new Date().getFullYear() + 3,
      holderName: null,
      gatewayPaymentMethodId: gatewayToken,
      gatewayCustomerId: `mock_cus_${randomBytes(6).toString('hex')}`,
    };
  }

  async detachCard(_gatewayPaymentMethodId: string): Promise<void> {
    return;
  }
}
