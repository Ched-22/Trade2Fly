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
  /** `return_and_refund` = produto volta (etiqueta reversa) e o reembolso sai quando o admin confirma o recebimento. */
  @IsIn(['refund_buyer', 'release_seller', 'return_and_refund'])
  outcome!: 'refund_buyer' | 'release_seller' | 'return_and_refund';

  /** Quem paga o frete de volta. Padrão: comprador se o motivo foi desistência, vendedor nos demais. */
  @IsOptional()
  @IsIn(['seller', 'buyer'])
  shippingPayer?: 'seller' | 'buyer';

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  note!: string;
}

export class AdminReturnLabelDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  trackingCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  labelUrl?: string;
}
