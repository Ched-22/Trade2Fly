import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../admin/guards/admin.guard';
import { DisputesService } from './disputes.service';
import { AdminDisputesQueryDto, AdminResolveDisputeDto } from './dto/admin-dispute.dto';
import { AdminDisputeReplyDto } from './dto/dispute-message.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/disputes')
export class AdminDisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  list(@Query() query: AdminDisputesQueryDto) {
    return this.disputesService.adminList(query);
  }

  @Get('order/:orderId')
  getByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.disputesService.adminGetByOrder(orderId);
  }

  @Post('order/:orderId/reply')
  reply(
    @Request() req: { user: { id: string } },
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: AdminDisputeReplyDto,
  ) {
    return this.disputesService.adminReply(req.user.id, orderId, dto.body);
  }

  @Post('order/:orderId/resolve')
  resolve(
    @Request() req: { user: { id: string } },
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: AdminResolveDisputeDto,
  ) {
    return this.disputesService.adminResolve(req.user.id, orderId, dto.outcome, dto.note);
  }
}
