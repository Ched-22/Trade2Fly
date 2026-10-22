import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { AdminPaginationQueryDto } from './admin-pagination.dto';

export class AdminUserOrdersQueryDto extends AdminPaginationQueryDto {
  @IsIn(['buyer', 'seller'])
  role: 'buyer' | 'seller';

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
