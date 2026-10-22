import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethodType, type PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentEncryptionService } from '../payment-encryption.service';
import { PaymentGatewayFactory } from '../gateway/payment-gateway.factory';
import { PaymentsConfigService } from '../payments-config.service';
import type { CreatePaymentMethodDto } from './dto/payment-method.dto';
import { formatPixKeyDisplay, maskPixKey, normalizePixKey, validatePixKey } from './pix-key.util';

const MAX_METHODS = 5;

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gatewayFactory: PaymentGatewayFactory,
    private readonly encryption: PaymentEncryptionService,
    private readonly paymentsConfig: PaymentsConfigService,
  ) {}

  async list(userId: string) {
    const items = await this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return items.map((item) => this.format(item));
  }

  async createSetupIntent(userId: string, email: string) {
    return this.gatewayFactory.getGateway().createSetupIntent(userId, email);
  }

  async create(userId: string, email: string, dto: CreatePaymentMethodDto) {
    const count = await this.prisma.paymentMethod.count({ where: { userId } });
    if (count >= MAX_METHODS) {
      throw new ConflictException({
        code: 'PAYMENT_METHOD_LIMIT',
        message: `Limite de ${MAX_METHODS} métodos de pagamento atingido.`,
      });
    }

    const setAsDefault = dto.setAsDefault ?? count === 0;

    if (dto.type === 'card') {
      if (!dto.gatewayToken) {
        throw new BadRequestException({ code: 'INVALID_CARD_TOKEN', message: 'Token do cartão obrigatório.' });
      }
      const gateway = this.gatewayFactory.getGateway();
      if (this.paymentsConfig.gatewayMode === 'mock' && !dto.gatewayToken.startsWith('mock_pm_')) {
        throw new BadRequestException({
          code: 'INVALID_CARD_TOKEN',
          message: 'Use um token mock_pm_ no modo de desenvolvimento.',
        });
      }
      const attached = await gateway.attachCard(userId, email, dto.gatewayToken);
      return this.persistMethod(userId, {
        type: PaymentMethodType.card,
        brand: attached.brand,
        last4: attached.last4,
        expMonth: attached.expMonth,
        expYear: attached.expYear,
        holderName: attached.holderName,
        gatewayPaymentMethodId: attached.gatewayPaymentMethodId,
        gatewayCustomerId: attached.gatewayCustomerId,
        isDefault: setAsDefault,
      });
    }

    if (!dto.pixKey || !dto.pixKeyType) {
      throw new BadRequestException({ code: 'INVALID_PIX_KEY', message: 'Chave Pix obrigatória.' });
    }
    if (!validatePixKey(dto.pixKey, dto.pixKeyType)) {
      throw new BadRequestException({
        code: 'INVALID_PIX_KEY',
        message: 'Chave Pix inválida para o tipo selecionado.',
      });
    }

    const normalized = normalizePixKey(dto.pixKey, dto.pixKeyType);
    const encrypted = this.encryption.encrypt(normalized);

    return this.persistMethod(userId, {
      type: PaymentMethodType.pix,
      pixKeyType: dto.pixKeyType,
      pixKeyEncrypted: encrypted,
      pixKeyMasked: maskPixKey(normalized, dto.pixKeyType),
      holderName: dto.holderName?.trim() || null,
      isDefault: setAsDefault,
    });
  }

  async setDefault(userId: string, id: string) {
    const method = await this.findOwned(userId, id);
    await this.prisma.$transaction([
      this.prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.paymentMethod.update({
        where: { id: method.id },
        data: { isDefault: true },
      }),
    ]);
    const updated = await this.prisma.paymentMethod.findUniqueOrThrow({ where: { id } });
    return this.format(updated);
  }

  async remove(userId: string, id: string) {
    const method = await this.findOwned(userId, id);
    if (method.type === PaymentMethodType.card && method.gatewayPaymentMethodId) {
      await this.gatewayFactory
        .getGateway()
        .detachCard(method.gatewayPaymentMethodId, method.gatewayCustomerId);
    }
    await this.prisma.paymentMethod.delete({ where: { id: method.id } });

    if (method.isDefault) {
      const next = await this.prisma.paymentMethod.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await this.prisma.paymentMethod.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Método removido com sucesso' };
  }

  getGatewayInfo() {
    return {
      enabled: this.paymentsConfig.enabled,
      gatewayMode: this.paymentsConfig.gatewayMode,
    };
  }

  private async persistMethod(
    userId: string,
    data: {
      type: PaymentMethodType;
      brand?: string;
      last4?: string;
      expMonth?: number;
      expYear?: number;
      holderName?: string | null;
      pixKeyType?: string;
      pixKeyEncrypted?: string;
      pixKeyMasked?: string;
      gatewayPaymentMethodId?: string;
      gatewayCustomerId?: string | null;
      isDefault: boolean;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.paymentMethod.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      const created = await tx.paymentMethod.create({
        data: {
          userId,
          type: data.type,
          brand: data.brand,
          last4: data.last4,
          expMonth: data.expMonth,
          expYear: data.expYear,
          holderName: data.holderName,
          pixKeyType: data.pixKeyType,
          pixKeyEncrypted: data.pixKeyEncrypted,
          pixKeyMasked: data.pixKeyMasked,
          gatewayPaymentMethodId: data.gatewayPaymentMethodId,
          gatewayCustomerId: data.gatewayCustomerId,
          isDefault: data.isDefault,
        },
      });
      return this.format(created);
    });
  }

  private async findOwned(userId: string, id: string): Promise<PaymentMethod> {
    const method = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!method || method.userId !== userId) {
      throw new NotFoundException({ code: 'PAYMENT_METHOD_NOT_FOUND', message: 'Método não encontrado.' });
    }
    return method;
  }

  private format(method: PaymentMethod) {
    if (method.type === PaymentMethodType.card) {
      return {
        id: method.id,
        type: 'card' as const,
        brand: method.brand ?? 'card',
        last4: method.last4 ?? '0000',
        expMonth: method.expMonth ?? 1,
        expYear: method.expYear ?? new Date().getFullYear(),
        holderName: method.holderName,
        isDefault: method.isDefault,
        createdAt: method.createdAt.toISOString(),
      };
    }

    return {
      id: method.id,
      type: 'pix' as const,
      pixKeyType: method.pixKeyType as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
      pixKeyMasked: method.pixKeyMasked ?? '***',
      holderName: method.holderName,
      isDefault: method.isDefault,
      createdAt: method.createdAt.toISOString(),
    };
  }
}

export { formatPixKeyDisplay, maskPixKey, validatePixKey };
