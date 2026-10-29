import { DisputeReason } from '@prisma/client';
import { IsEnum, IsIn, IsString, MinLength, ValidateIf } from 'class-validator';

export class ReceiptDecisionDto {
  @IsIn(['confirm', 'dispute'])
  decision!: 'confirm' | 'dispute';

  @ValidateIf((dto: ReceiptDecisionDto) => dto.decision === 'dispute')
  @IsEnum(DisputeReason, { message: 'Informe o tipo de problema.' })
  reasonType?: DisputeReason;

  @ValidateIf((dto: ReceiptDecisionDto) => dto.decision === 'dispute')
  @IsString()
  @MinLength(10)
  reason?: string;
}
