import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsInt()
  listingId!: number;

  @ApiProperty({ enum: ['pix', 'card', 'boleto'] })
  @IsIn(['pix', 'card', 'boleto'])
  paymentType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ enum: ['shipping', 'pickup'], description: 'Envio (frete cobrado) ou retirada em mãos' })
  @IsOptional()
  @IsIn(['shipping', 'pickup'])
  deliveryMode?: 'shipping' | 'pickup';

  @ApiPropertyOptional({ description: 'Contrata o seguro de frete opcional (só com envio)' })
  @IsOptional()
  @IsBoolean()
  shippingInsurance?: boolean;

  @ApiPropertyOptional({ description: 'CEP de entrega, 8 dígitos (obrigatório com envio)' })
  @ValidateIf((dto) => dto.deliveryMode !== 'pickup')
  @Matches(/^\d{8}$/, { message: 'CEP de entrega inválido' })
  shippingZip?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.deliveryMode !== 'pickup')
  @IsString()
  @MaxLength(160)
  shippingStreet?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.deliveryMode !== 'pickup')
  @IsString()
  @MaxLength(20)
  shippingNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  shippingComplement?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.deliveryMode !== 'pickup')
  @IsString()
  @MaxLength(80)
  shippingDistrict?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.deliveryMode !== 'pickup')
  @IsString()
  @MaxLength(80)
  shippingCity?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.deliveryMode !== 'pickup')
  @Matches(/^[A-Za-z]{2}$/, { message: 'UF de entrega inválida' })
  shippingState?: string;

  @ApiProperty({ description: 'CPF ou CNPJ do comprador, somente dígitos' })
  @IsString()
  @Matches(/^\d{11}$|^\d{14}$/, { message: 'CPF/CNPJ inválido' })
  cpfCnpj!: string;

  @ApiPropertyOptional({ description: 'Parcelas no cartão (1 a 12)' })
  @ValidateIf((dto) => dto.paymentType === 'card')
  @IsInt()
  @Min(1)
  @Max(12)
  installments?: number;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.paymentType === 'card')
  @IsString()
  cardHolderName?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.paymentType === 'card')
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Número de cartão inválido' })
  cardNumber?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.paymentType === 'card')
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Mês de validade inválido' })
  cardExpiryMonth?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.paymentType === 'card')
  @Matches(/^\d{4}$/, { message: 'Ano de validade inválido' })
  cardExpiryYear?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.paymentType === 'card')
  @Matches(/^\d{3,4}$/, { message: 'CVV inválido' })
  cardCcv?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.paymentType === 'card')
  @IsString()
  @Matches(/^\d{8}$/, { message: 'CEP inválido' })
  cardHolderPostalCode?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.paymentType === 'card')
  @IsString()
  cardHolderAddressNumber?: string;

  @ApiPropertyOptional({ description: 'Telefone com DDD, somente dígitos' })
  @ValidateIf((dto) => dto.paymentType === 'card')
  @Matches(/^\d{10,11}$/, { message: 'Telefone inválido' })
  cardHolderPhone?: string;
}
