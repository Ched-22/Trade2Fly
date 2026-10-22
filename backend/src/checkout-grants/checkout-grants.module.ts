import { Module, forwardRef } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CheckoutGrantsController } from './checkout-grants.controller';
import { CheckoutGrantsService } from './checkout-grants.service';

@Module({
  imports: [forwardRef(() => ChatModule), NotificationsModule],
  controllers: [CheckoutGrantsController],
  providers: [CheckoutGrantsService],
  exports: [CheckoutGrantsService],
})
export class CheckoutGrantsModule {}
