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

  @Get(':threadId')
  getMessages(@Request() req: any, @Param('threadId', ParseIntPipe) threadId: number) {
    return this.messagesService.getMessages(req.user.id, threadId);
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
