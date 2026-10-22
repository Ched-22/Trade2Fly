import { Equals, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateCheckoutGrantDto {
  @IsNumber()
  threadId!: number;

  @IsNumber()
  @Min(0.01)
  agreedPrice!: number;

  @IsBoolean()
  @Equals(true, { message: 'sellerAcknowledgedWarning must be true' })
  sellerAcknowledgedWarning!: boolean;
}
