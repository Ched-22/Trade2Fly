import { IsBoolean, IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class SetupIntentDto {
  @IsIn(['card'])
  type!: 'card';
}

export class CreateCardPaymentMethodDto {
  @IsIn(['card'])
  type!: 'card';

  @IsString()
  @MinLength(3)
  gatewayToken!: string;

  @IsOptional()
  @IsBoolean()
  setAsDefault?: boolean;
}

export class CreatePixPaymentMethodDto {
  @IsIn(['pix'])
  type!: 'pix';

  @IsString()
  @MinLength(3)
  pixKey!: string;

  @IsIn(['cpf', 'cnpj', 'email', 'phone', 'random'])
  pixKeyType!: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

  @IsOptional()
  @IsString()
  holderName?: string;

  @IsOptional()
  @IsBoolean()
  setAsDefault?: boolean;
}

export class CreatePaymentMethodDto {
  @IsIn(['card', 'pix'])
  type!: 'card' | 'pix';

  @ValidateIf((o) => o.type === 'card')
  @IsString()
  @MinLength(3)
  gatewayToken?: string;

  @ValidateIf((o) => o.type === 'pix')
  @IsString()
  @MinLength(3)
  pixKey?: string;

  @ValidateIf((o) => o.type === 'pix')
  @IsIn(['cpf', 'cnpj', 'email', 'phone', 'random'])
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

  @IsOptional()
  @IsString()
  holderName?: string;

  @IsOptional()
  @IsBoolean()
  setAsDefault?: boolean;
}
