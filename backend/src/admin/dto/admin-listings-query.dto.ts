import { IsOptional, IsString } from 'class-validator';
import { AdminPaginationQueryDto } from './admin-pagination.dto';

export class AdminListingsQueryDto extends AdminPaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsString()
  saleMode?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
