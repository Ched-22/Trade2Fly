import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  escrow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
