import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class ReceiptDecisionDto {
  @IsIn(['confirm', 'dispute'])
  decision!: 'confirm' | 'dispute';

  @ValidateIf((dto: ReceiptDecisionDto) => dto.decision === 'dispute')
  @IsString()
  @MinLength(10)
  reason?: string;
}
