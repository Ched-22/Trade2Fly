import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ana.martins@email.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;
}
