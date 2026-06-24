import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true, initials: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: any = {};

    if (dto.fullName) {
      const { displayName, initials } = deriveProfile(dto.fullName);
      data.displayName = displayName;
      data.initials = initials;
    }

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, displayName: true, initials: true },
    });

    return user;
  }
}
