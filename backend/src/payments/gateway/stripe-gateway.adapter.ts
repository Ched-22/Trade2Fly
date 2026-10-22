import { BadGatewayException, Injectable } from '@nestjs/common';
import { PaymentsConfigService } from '../payments-config.service';
import type {
  AttachedCardDetails,
  PaymentGateway,
  SetupIntentResult,
} from './payment-gateway.interface';

type StripeClient = {
  customers: {
    list: (params: { email: string; limit: number }) => Promise<{ data: { id: string }[] }>;
    create: (params: { email: string; metadata: Record<string, string> }) => Promise<{ id: string }>;
  };
  setupIntents: {
    create: (params: Record<string, unknown>) => Promise<{ client_secret: string | null }>;
  };
  paymentMethods: {
    retrieve: (id: string) => Promise<{
      id: string;
      type: string;
      card?: { brand: string; last4: string; exp_month: number; exp_year: number };
      billing_details: { name: string | null };
    }>;
    attach: (id: string, params: { customer: string }) => Promise<unknown>;
    detach: (id: string) => Promise<unknown>;
  };
};

@Injectable()
export class StripeGatewayAdapter implements PaymentGateway {
  private stripe: StripeClient | null = null;

  constructor(private readonly paymentsConfig: PaymentsConfigService) {}

  private async getClient(): Promise<StripeClient> {
    if (!this.stripe) {
      this.paymentsConfig.assertStripeConfigured();
      try {
        const Stripe = (await import('stripe')).default;
        this.stripe = new Stripe(this.paymentsConfig.stripeSecretKey!, {
          apiVersion: '2024-06-20',
        }) as unknown as StripeClient;
      } catch {
        throw new BadGatewayException({
          code: 'GATEWAY_NOT_CONFIGURED',
          message: 'SDK Stripe não disponível. Execute npm install no backend.',
        });
      }
    }
    return this.stripe;
  }

  private async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    const stripe = await this.getClient();
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data[0]) return existing.data[0].id;
    const created = await stripe.customers.create({
      email,
      metadata: { trade2flyUserId: userId },
    });
    return created.id;
  }

  async createSetupIntent(userId: string, email: string): Promise<SetupIntentResult> {
    try {
      const stripe = await this.getClient();
      const customerId = await this.getOrCreateCustomer(userId, email);
      const intent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: { trade2flyUserId: userId },
      });
      return {
        provider: 'stripe',
        clientSecret: intent.client_secret!,
        publishableKey: this.paymentsConfig.stripePublishableKey ?? null,
      };
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException({
        code: 'GATEWAY_ERROR',
        message: 'Não foi possível iniciar cadastro do cartão.',
      });
    }
  }

  async attachCard(userId: string, email: string, gatewayToken: string): Promise<AttachedCardDetails> {
    try {
      const stripe = await this.getClient();
      const customerId = await this.getOrCreateCustomer(userId, email);
      const pm = await stripe.paymentMethods.retrieve(gatewayToken);
      if (pm.type !== 'card' || !pm.card) {
        throw new Error('Not a card payment method');
      }
      await stripe.paymentMethods.attach(gatewayToken, { customer: customerId });
      return {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        holderName: pm.billing_details.name ?? null,
        gatewayPaymentMethodId: pm.id,
        gatewayCustomerId: customerId,
      };
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException({
        code: 'GATEWAY_ERROR',
        message: 'Não foi possível salvar o cartão.',
      });
    }
  }

  async detachCard(gatewayPaymentMethodId: string): Promise<void> {
    try {
      const stripe = await this.getClient();
      await stripe.paymentMethods.detach(gatewayPaymentMethodId);
    } catch {
      // Best effort
    }
  }
}
