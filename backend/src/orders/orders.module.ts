import { Module, forwardRef } from '@nestjs/common';
import { CheckoutGrantsModule } from '../checkout-grants/checkout-grants.module';
import { FulfillmentModule } from '../fulfillment/fulfillment.module';
import { AsaasModule } from '../payments/asaas/asaas.module';
import { ShippingModule } from '../shipping/shipping.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    forwardRef(() => FulfillmentModule),
    CheckoutGrantsModule,
    forwardRef(() => AsaasModule),
    ShippingModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
