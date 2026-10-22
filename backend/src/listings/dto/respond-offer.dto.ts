import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class RespondOfferDto {
  @IsNumber()
  threadId!: number;

  @IsNumber()
  offerMessageId!: number;

  @IsIn(['accept', 'decline', 'counter'])
  action!: 'accept' | 'decline' | 'counter';

  @ValidateIf((dto: RespondOfferDto) => dto.action === 'counter')
  @IsNumber()
  @Min(0.01)
  offerAmount?: number;

  @IsOptional()
  @IsString()
  text?: string;

  /** Required when the seller accepts (creates checkout grant). */
  @ValidateIf((dto: RespondOfferDto) => dto.action === 'accept')
  @IsOptional()
  @IsBoolean()
  sellerAcknowledgedWarning?: boolean;
}
