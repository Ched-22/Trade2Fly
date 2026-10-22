import { Module, forwardRef } from '@nestjs/common';
import { OrdersModule } from '../../orders/orders.module';
import { PaymentsConfigService } from '../payments-config.service';
import { PaymentEncryptionService } from '../payment-encryption.service';
import { AsaasConfigService } from './asaas-config.service';
import { AsaasClientService } from './asaas-client.service';
import { AsaasPaymentsService } from './asaas-payments.service';
import { AsaasPayoutsService } from './asaas-payouts.service';
import { AsaasWebhookController } from './asaas-webhook.controller';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  controllers: [AsaasWebhookController],
  providers: [
    AsaasConfigService,
    AsaasClientService,
    AsaasPaymentsService,
    AsaasPayoutsService,
    PaymentsConfigService,
    PaymentEncryptionService,
  ],
  exports: [AsaasConfigService, AsaasClientService, AsaasPaymentsService, AsaasPayoutsService],
})
export class AsaasModule {}
