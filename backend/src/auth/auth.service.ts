import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

function deriveProfile(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const displayName = parts[0] ?? fullName.trim();
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.slice(0, 2) ?? '??').toUpperCase();
  return { displayName, initials };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private signToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email });
  }

  private userResponse(user: {
    id: string;
    email: string;
    displayName: string;
    initials: string;
    active: boolean;
  }) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      initials: user.initials,
      active: user.active,
    };
  }

  private assertActive(user: { active: boolean }) {
    if (!user.active) {
      throw new UnauthorizedException(
        'Conta inativa. Aguarde a ativação ou entre em contato com o suporte.',
      );
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('E-mail ou senha incorretos');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('E-mail ou senha incorretos');

    this.assertActive(user);

    return { token: this.signToken(user.id, user.email), user: this.userResponse(user) };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const { displayName, initials } = deriveProfile(dto.fullName);
    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hash,
        displayName,
        initials,
        active: false,
      },
    });

    return {
      message:
        'Conta criada com sucesso. Aguarde a ativação da sua conta para entrar.',
      requiresActivation: true,
      user: this.userResponse(user),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    const message = 'Se o e-mail estiver cadastrado, você receberá um link de redefinição em breve.';

    if (!user) return { message };

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const isDev = this.config.get('NODE_ENV') !== 'production';
    return { message, ...(isDev && { devToken: token }) };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token: dto.token } });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Link de redefinição inválido ou expirado');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { password: hash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    ]);

    return { message: 'Senha redefinida com sucesso' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    this.assertActive(user);
    return this.userResponse(user);
  }
}
