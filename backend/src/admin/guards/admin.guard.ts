import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  handleRequest<TUser extends { role?: UserRole }>(
    err: unknown,
    user: TUser,
  ): TUser {
    if (err || !user) {
      throw err ?? new ForbiddenException();
    }
    if (user.role !== UserRole.admin) {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }
    return user;
  }
}
