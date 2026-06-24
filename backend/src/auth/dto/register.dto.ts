import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Martins' })
  @IsString()
  @Matches(/^(\S+\s+)+\S+$/, { message: 'Informe nome e sobrenome' })
  fullName: string;

  @ApiProperty({ example: 'ana.martins@email.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter ao menos 8 caracteres' })
  password: string;
}
