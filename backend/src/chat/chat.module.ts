import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessagesModule } from '../messages/messages.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AuthModule, forwardRef(() => MessagesModule)],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
