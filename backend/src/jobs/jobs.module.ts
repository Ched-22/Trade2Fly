import { Module } from '@nestjs/common';
import { CheckoutGrantsModule } from '../checkout-grants/checkout-grants.module';
import { FulfillmentModule } from '../fulfillment/fulfillment.module';
import { CheckoutGrantExpiryService } from './checkout-grant-expiry.service';
import { OrderAutoCompleteService } from './order-auto-complete.service';

@Module({
  imports: [FulfillmentModule, CheckoutGrantsModule],
  providers: [OrderAutoCompleteService, CheckoutGrantExpiryService],
})
export class JobsModule {}
