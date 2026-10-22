import { IsOptional, IsString } from 'class-validator';
import { AdminPaginationQueryDto } from './admin-pagination.dto';

export class AdminUsersQueryDto extends AdminPaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  active?: string;
}
