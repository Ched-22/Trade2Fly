import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './guards/admin.guard';
import { AdminListingsService } from './admin-listings.service';
import { AdminListingsQueryDto } from './dto/admin-listings-query.dto';
import { AdminUpdateListingDto } from './dto/admin-update-listing.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/listings')
export class AdminListingsController {
  constructor(private readonly listingsService: AdminListingsService) {}

  @Get()
  findAll(@Query() query: AdminListingsQueryDto) {
    return this.listingsService.findAll(query);
  }

  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateListingDto,
  ) {
    return this.listingsService.updateActive(req.user.id, id, dto);
  }
}
