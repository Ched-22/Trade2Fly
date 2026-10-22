import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type PaymentGatewayMode = 'mock' | 'stripe';

@Injectable()
export class PaymentsConfigService {
  constructor(private readonly config: ConfigService) {}

  get enabled(): boolean {
    return this.config.get<string>('PAYMENT_METHODS_ENABLED') === 'true';
  }

  get gatewayMode(): PaymentGatewayMode {
    const mode = this.config.get<string>('PAYMENT_GATEWAY_MODE') ?? 'mock';
    return mode === 'stripe' ? 'stripe' : 'mock';
  }

  get stripeSecretKey(): string | undefined {
    return this.config.get<string>('STRIPE_SECRET_KEY');
  }

  get stripePublishableKey(): string | undefined {
    return this.config.get<string>('STRIPE_PUBLISHABLE_KEY');
  }

  get stripeWebhookSecret(): string | undefined {
    return this.config.get<string>('STRIPE_WEBHOOK_SECRET');
  }

  get encryptionKey(): string | undefined {
    return this.config.get<string>('PAYMENT_DATA_ENCRYPTION_KEY');
  }

  get rateLimitPerMin(): number {
    return Number(this.config.get<string>('PAYMENT_RATE_LIMIT_PER_MIN') ?? 30);
  }

  assertStripeConfigured() {
    if (!this.stripeSecretKey || !this.stripePublishableKey) {
      throw new Error('STRIPE keys required when PAYMENT_GATEWAY_MODE=stripe');
    }
  }
}
