import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @Min(0.01)
  offerAmount!: number;

  @IsOptional()
  @IsString()
  text?: string;
}
