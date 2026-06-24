import { IsIn, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsInt()
  listingId: number;

  @ApiProperty({ enum: ['pix', 'card'] })
  @IsIn(['pix', 'card'])
  paymentType: string;
}
