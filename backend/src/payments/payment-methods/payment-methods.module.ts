import { Module } from '@nestjs/common';
import { PaymentsConfigService } from '../payments-config.service';
import { PaymentEncryptionService } from '../payment-encryption.service';
import { MockGatewayAdapter } from '../gateway/mock-gateway.adapter';
import { PaymentGatewayFactory } from '../gateway/payment-gateway.factory';
import { StripeGatewayAdapter } from '../gateway/stripe-gateway.adapter';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsEnabledGuard, PaymentRateLimitGuard } from './guards/payment-methods.guard';

@Module({
  controllers: [PaymentMethodsController],
  providers: [
    PaymentsConfigService,
    PaymentEncryptionService,
    MockGatewayAdapter,
    StripeGatewayAdapter,
    PaymentGatewayFactory,
    PaymentMethodsService,
    PaymentMethodsEnabledGuard,
    PaymentRateLimitGuard,
  ],
  exports: [PaymentMethodsService, PaymentsConfigService],
})
export class PaymentMethodsModule {}
