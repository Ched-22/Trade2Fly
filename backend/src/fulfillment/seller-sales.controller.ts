import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SellerSalesSummaryQueryDto } from './dto/seller-sales-summary-query.dto';
import { FulfillmentService } from './fulfillment.service';

@ApiTags('seller-sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('seller')
export class SellerSalesController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Get('sales-summary')
  getSummary(
    @Request() req: { user: { id: string } },
    @Query() query: SellerSalesSummaryQueryDto,
  ) {
    return this.fulfillmentService.getSellerSalesSummary(req.user.id, query.periodDays ?? 30);
  }

  @Get('commission')
  getCommission(@Request() req: { user: { id: string } }) {
    return this.fulfillmentService.getSellerCommissionInfo(req.user.id);
  }
}
