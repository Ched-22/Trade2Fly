import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

class ReplyDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getThreads(@Request() req: any) {
    return this.messagesService.getThreads(req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.messagesService.getUnreadThreadCount(req.user.id).then((count) => ({ count }));
  }

  @Get(':threadId/suggested-price')
  getSuggestedPrice(@Request() req: any, @Param('threadId', ParseIntPipe) threadId: number) {
    return this.messagesService.getSuggestedPrice(req.user.id, threadId);
  }

  @Get(':threadId')
  getMessages(@Request() req: any, @Param('threadId', ParseIntPipe) threadId: number) {
    return this.messagesService.getMessages(req.user.id, threadId);
  }

  @Post(':threadId/read')
  markRead(@Request() req: any, @Param('threadId', ParseIntPipe) threadId: number) {
    return this.messagesService.markThreadAsRead(req.user.id, threadId).then(() => ({ ok: true }));
  }

  @Post()
  sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.id, dto);
  }

  @Post(':threadId')
  reply(
    @Request() req: any,
    @Param('threadId', ParseIntPipe) threadId: number,
    @Body() dto: ReplyDto,
  ) {
    return this.messagesService.sendToThread(req.user.id, threadId, dto.text);
  }
}
