import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { SupportChatService } from './support-chat.service';
import { SendSupportMessageDto } from './dto/send-support-message.dto';

@ApiTags('support-chat')
@UseGuards(OptionalJwtAuthGuard)
@Controller('support-chat')
export class SupportChatController {
  constructor(private readonly supportChatService: SupportChatService) {}

  @Post('message')
  sendMessage(@Request() req: any, @Body() dto: SendSupportMessageDto) {
    const userId: string | null = req.user?.id ?? null;
    return this.supportChatService.sendMessage(userId, dto);
  }
}
