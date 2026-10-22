import { IsOptional, IsString } from 'class-validator';
import { AdminPaginationQueryDto } from './admin-pagination.dto';

export class AdminViolationsQueryDto extends AdminPaginationQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  listingId?: string;
}
