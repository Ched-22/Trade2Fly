import { Module, forwardRef } from '@nestjs/common';
import { FulfillmentModule } from '../fulfillment/fulfillment.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AsaasModule } from '../payments/asaas/asaas.module';
import { AdminDisputesController } from './admin-disputes.controller';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';

@Module({
  imports: [NotificationsModule, forwardRef(() => FulfillmentModule), forwardRef(() => AsaasModule)],
  controllers: [DisputesController, AdminDisputesController],
  providers: [DisputesService],
})
export class DisputesModule {}
