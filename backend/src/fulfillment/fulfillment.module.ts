import { Module, forwardRef } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { AsaasModule } from '../payments/asaas/asaas.module';
import { FulfillmentService } from './fulfillment.service';
import { OrderFulfillmentController } from './order-fulfillment.controller';
import { SellerOrdersController } from './seller-orders.controller';
import { SellerSalesController } from './seller-sales.controller';

@Module({
  imports: [NotificationsModule, MediaModule, forwardRef(() => OrdersModule), forwardRef(() => AsaasModule)],
  providers: [FulfillmentService],
  controllers: [SellerOrdersController, SellerSalesController, OrderFulfillmentController],
  exports: [FulfillmentService],
})
export class FulfillmentModule {}
