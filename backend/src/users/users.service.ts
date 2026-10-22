import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

function deriveProfile(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const displayName = parts[0] ?? fullName.trim();
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.slice(0, 2) ?? '??').toUpperCase();
  return { displayName, initials };
}

function deriveInitialsFromParts(firstName?: string, lastName?: string): string {
  const first = firstName?.trim()[0] ?? '';
  const last = lastName?.trim()[0] ?? '';
  const combined = `${first}${last}`.toUpperCase();
  return combined || '??';
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Perfil público — visível para qualquer visitante (ex: página de anúncio). Nunca inclui dados de contato. */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true, initials: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const completedSalesCount = await this.prisma.order.count({
      where: { status: OrderStatus.completed, listing: { sellerId: id } },
    });

    return { ...user, completedSalesCount };
  }

  /** Perfil completo do próprio usuário autenticado — inclui dados de contato/perfil editáveis. */
  async findMe(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        initials: true,
        firstName: true,
        lastName: true,
        bio: true,
        city: true,
        dropzone: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {};

    if (dto.fullName) {
      const { displayName, initials } = deriveProfile(dto.fullName);
      data.displayName = displayName;
      data.initials = initials;
    }

    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.firstName?.trim() || dto.lastName?.trim()) {
      data.initials = deriveInitialsFromParts(dto.firstName, dto.lastName);
    }

    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.dropzone !== undefined) data.dropzone = dto.dropzone;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        initials: true,
        firstName: true,
        lastName: true,
        bio: true,
        city: true,
        dropzone: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return user;
  }
}
