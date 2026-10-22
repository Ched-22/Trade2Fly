import { Injectable } from '@nestjs/common';
import { PaymentsConfigService } from '../payments-config.service';
import { MockGatewayAdapter } from './mock-gateway.adapter';
import type { PaymentGateway } from './payment-gateway.interface';
import { StripeGatewayAdapter } from './stripe-gateway.adapter';

@Injectable()
export class PaymentGatewayFactory {
  private readonly mock = new MockGatewayAdapter();

  constructor(
    private readonly paymentsConfig: PaymentsConfigService,
    private readonly stripeGateway: StripeGatewayAdapter,
  ) {}

  getGateway(): PaymentGateway {
    return this.paymentsConfig.gatewayMode === 'stripe' ? this.stripeGateway : this.mock;
  }
}
