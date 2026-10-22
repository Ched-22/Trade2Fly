import { Module, forwardRef } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { CheckoutGrantsModule } from '../checkout-grants/checkout-grants.module';
import { MediaModule } from '../media/media.module';
import { MessagesModule } from '../messages/messages.module';
import { ListingsService } from './listings.service';
import { OffersService } from './offers.service';
import { ListingsController } from './listings.controller';

@Module({
  imports: [
    MediaModule,
    CheckoutGrantsModule,
    forwardRef(() => MessagesModule),
    forwardRef(() => ChatModule),
  ],
  providers: [ListingsService, OffersService],
  controllers: [ListingsController],
  exports: [ListingsService],
})
export class ListingsModule {}
