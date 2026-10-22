import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentEncryptionService } from '../payment-encryption.service';
import type { PixKeyType } from '../payment-methods/pix-key.util';
import { maskPixKey, normalizePixKey, validatePixKey } from '../payment-methods/pix-key.util';
import { AsaasClientService } from './asaas-client.service';
import type { AsaasTransfer } from './asaas.types';

const PIX_KEY_TYPE_ASAAS: Record<PixKeyType, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'EMAIL',
  phone: 'PHONE',
  random: 'EVP',
};

/**
 * Cadastro da chave Pix de recebimento do vendedor e transferência do valor liberado da venda,
 * feita a partir da conta principal da Trade2Fly (nenhuma subconta é necessária).
 */
@Injectable()
export class AsaasPayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly client: AsaasClientService,
    private readonly encryption: PaymentEncryptionService,
  ) {}

  async setPayoutPixKey(sellerId: string, pixKeyType: PixKeyType, pixKey: string) {
    if (!validatePixKey(pixKey, pixKeyType)) {
      throw new BadRequestException({ code: 'INVALID_PIX_KEY', message: 'Chave Pix inválida.' });
    }
    const normalized = normalizePixKey(pixKey, pixKeyType);

    await this.prisma.user.update({
      where: { id: sellerId },
      data: {
        payoutPixKeyType: pixKeyType,
        payoutPixKeyEncrypted: this.encryption.encrypt(normalized),
        payoutPixKeyMasked: maskPixKey(normalized, pixKeyType),
      },
    });

    return { pixKeyType, pixKeyMasked: maskPixKey(normalized, pixKeyType) };
  }

  async getPayoutStatus(sellerId: string) {
    const seller = await this.prisma.user.findUniqueOrThrow({
      where: { id: sellerId },
      select: { payoutPixKeyType: true, payoutPixKeyMasked: true },
    });
    return {
      hasPixKey: Boolean(seller.payoutPixKeyType && seller.payoutPixKeyMasked),
      pixKeyType: seller.payoutPixKeyType,
      pixKeyMasked: seller.payoutPixKeyMasked,
    };
  }

  private async getSellerPixKey(sellerId: string): Promise<{ type: PixKeyType; key: string }> {
    const seller = await this.prisma.user.findUniqueOrThrow({ where: { id: sellerId } });
    if (!seller.payoutPixKeyType || !seller.payoutPixKeyEncrypted) {
      throw new BadRequestException({
        code: 'SELLER_PAYOUT_NOT_CONFIGURED',
        message: 'O vendedor ainda não cadastrou uma chave Pix para receber pagamentos.',
      });
    }
    return {
      type: seller.payoutPixKeyType as PixKeyType,
      key: this.encryption.decrypt(seller.payoutPixKeyEncrypted),
    };
  }

  /** Transfere o valor líquido da venda (já descontada a comissão) para a chave Pix do vendedor. */
  async transferToSeller(sellerId: string, amount: number): Promise<AsaasTransfer> {
    const { type, key } = await this.getSellerPixKey(sellerId);
    return this.client.post<AsaasTransfer>('/transfers', {
      value: amount,
      pixAddressKey: key,
      pixAddressKeyType: PIX_KEY_TYPE_ASAAS[type],
    });
  }

  async assertSellerHasPayoutConfigured(sellerId: string) {
    await this.getSellerPixKey(sellerId);
  }
}
