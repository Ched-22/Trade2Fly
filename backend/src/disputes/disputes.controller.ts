import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DisputesService } from './disputes.service';
import { DisputeMessageDto } from './dto/dispute-message.dto';

@ApiTags('disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders/:orderId/dispute')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  get(@Request() req: { user: { id: string } }, @Param('orderId', ParseIntPipe) orderId: number) {
    return this.disputesService.getForBuyer(req.user.id, orderId);
  }

  @Post('reply')
  reply(
    @Request() req: { user: { id: string } },
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: DisputeMessageDto,
  ) {
    return this.disputesService.buyerReply(req.user.id, orderId, dto.body);
  }

  @Post('confirm-resolved')
  confirmResolved(
    @Request() req: { user: { id: string } },
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.disputesService.buyerConfirmResolved(req.user.id, orderId);
  }
}
