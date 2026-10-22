import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SetPayoutPixKeyDto {
  @IsIn(['cpf', 'cnpj', 'email', 'phone', 'random'])
  pixKeyType!: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

  @IsString()
  @IsNotEmpty()
  pixKey!: string;
}
