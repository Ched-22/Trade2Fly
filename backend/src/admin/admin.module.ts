import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminListingsController } from './admin-listings.controller';
import { AdminListingsService } from './admin-listings.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminViolationsController } from './admin-violations.controller';
import { AdminViolationsService } from './admin-violations.service';

@Module({
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminListingsController,
    AdminOrdersController,
    AdminViolationsController,
  ],
  providers: [
    AdminDashboardService,
    AdminUsersService,
    AdminListingsService,
    AdminOrdersService,
    AdminViolationsService,
  ],
})
export class AdminModule {}
