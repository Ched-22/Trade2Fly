import { Controller, Get, Param, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminGuard } from './guards/admin.guard';
import { AdminOrdersService } from './admin-orders.service';
import { AdminCompletedSummaryQueryDto } from './dto/admin-completed-summary-query.dto';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get('export')
  exportCsv(@Query() query: AdminOrdersQueryDto, @Res() res: Response) {
    return this.ordersService.exportCsv(query, res);
  }

  @Get('completed-summary')
  getCompletedSummary(@Query() query: AdminCompletedSummaryQueryDto) {
    return this.ordersService.getCompletedSummary(query);
  }

  @Get()
  findAll(@Query() query: AdminOrdersQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }
}
