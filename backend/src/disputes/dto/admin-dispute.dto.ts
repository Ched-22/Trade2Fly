import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class AdminDisputesQueryDto {
  /** `open` = aguardando admin ou comprador. */
  @IsOptional()
  @IsIn(['open', 'awaiting_admin', 'awaiting_buyer', 'resolved'])
  status?: 'open' | 'awaiting_admin' | 'awaiting_buyer' | 'resolved';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class AdminResolveDisputeDto {
  @IsIn(['refund_buyer', 'release_seller'])
  outcome!: 'refund_buyer' | 'release_seller';

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  note!: string;
}
