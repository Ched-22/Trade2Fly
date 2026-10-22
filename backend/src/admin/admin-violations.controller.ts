import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './guards/admin.guard';
import { AdminViolationsService } from './admin-violations.service';
import { AdminViolationsQueryDto } from './dto/admin-violations-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/checkout-violations')
export class AdminViolationsController {
  constructor(private readonly violationsService: AdminViolationsService) {}

  @Get()
  findAll(@Query() query: AdminViolationsQueryDto) {
    return this.violationsService.findAll(query);
  }
}
