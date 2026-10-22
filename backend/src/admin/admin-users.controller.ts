import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './guards/admin.guard';
import { AdminOrdersService } from './admin-orders.service';
import { AdminUsersService } from './admin-users.service';
import { AdminUserOrdersQueryDto } from './dto/admin-user-orders-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly usersService: AdminUsersService,
    private readonly ordersService: AdminOrdersService,
  ) {}

  @Get()
  findAll(@Query() query: AdminUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id/orders')
  findUserOrders(@Param('id') id: string, @Query() query: AdminUserOrdersQueryDto) {
    return this.ordersService.findForUser(id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.updateActive(req.user.id, id, dto);
  }
}
