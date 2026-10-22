import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MessagesModule } from './messages/messages.module';
import { OrdersModule } from './orders/orders.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { CheckoutGrantsModule } from './checkout-grants/checkout-grants.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DisputesModule } from './disputes/disputes.module';
import { FulfillmentModule } from './fulfillment/fulfillment.module';
import { JobsModule } from './jobs/jobs.module';
import { ShippingModule } from './shipping/shipping.module';
import { PaymentMethodsModule } from './payments/payment-methods/payment-methods.module';
import { SupportChatModule } from './support-chat/support-chat.module';
import { SellersModule } from './sellers/sellers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    MediaModule,
    FavoritesModule,
    MessagesModule,
    ChatModule,
    NotificationsModule,
    FulfillmentModule,
    DisputesModule,
    OrdersModule,
    CheckoutGrantsModule,
    AdminModule,
    JobsModule,
    ShippingModule,
    PaymentMethodsModule,
    SupportChatModule,
    SellersModule,
  ],
})
export class AppModule {}
