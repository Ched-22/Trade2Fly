import { IsIn, IsOptional } from 'class-validator';

export class OrderScopeQueryDto {
  @IsOptional()
  @IsIn(['active', 'history', 'all'])
  scope?: 'active' | 'history' | 'all';
}
