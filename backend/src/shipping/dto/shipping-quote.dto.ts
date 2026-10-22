import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Matches } from 'class-validator';

export class ShippingQuoteDto {
  @ApiProperty()
  @IsInt()
  listingId!: number;

  @ApiProperty({ description: 'CEP de destino com 8 dígitos' })
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @IsString()
  @Matches(/^\d{8}$/, { message: 'Informe um CEP válido com 8 dígitos.' })
  destinationCep!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destinationCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  destinationState?: string;
}
