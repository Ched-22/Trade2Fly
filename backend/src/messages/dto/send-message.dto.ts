import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty()
  @IsInt()
  listingId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;
}
