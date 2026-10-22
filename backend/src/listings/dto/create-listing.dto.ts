import { Equals, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  priceNum: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jumps?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ enum: ['Novo', 'Bom', 'Usado'] })
  @IsNotEmpty()
  @IsString()
  @IsIn(['Novo', 'Bom', 'Usado'])
  condition: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'CEP de origem do envio com 8 dígitos' })
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @IsString()
  @Matches(/^\d{8}$/, { message: 'Informe um CEP válido com 8 dígitos.' })
  postalCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  escrow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Confirmação de aceite dos termos do vendedor e taxas da plataforma',
  })
  @IsBoolean()
  @Equals(true, { message: 'É necessário aceitar os termos para publicar o anúncio.' })
  acceptedSellerTerms: boolean;
}
