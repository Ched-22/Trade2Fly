import { IsIn, IsOptional } from 'class-validator';

export class MyListingsQueryDto {
  @IsOptional()
  @IsIn(['true', 'false', 'all'])
  active?: 'true' | 'false' | 'all';
}
