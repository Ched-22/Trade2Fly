import { IsString, MaxLength, MinLength } from 'class-validator';

export class DisputeMessageDto {
  @IsString()
  @MinLength(10, { message: 'Descreva o problema com pelo menos 10 caracteres.' })
  @MaxLength(2000)
  body!: string;
}

export class AdminDisputeReplyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}
