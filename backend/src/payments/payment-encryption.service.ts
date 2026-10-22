import { BadRequestException, Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { PaymentsConfigService } from './payments-config.service';

@Injectable()
export class PaymentEncryptionService {
  constructor(private readonly paymentsConfig: PaymentsConfigService) {}

  private deriveKey(): Buffer {
    const raw = this.paymentsConfig.encryptionKey;
    if (!raw?.trim()) {
      throw new BadRequestException({
        code: 'PAYMENT_ENCRYPTION_NOT_CONFIGURED',
        message: 'Criptografia de pagamentos não configurada.',
      });
    }
    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
      return Buffer.from(raw, 'hex');
    }
    return scryptSync(raw, 'trade2fly-payment-salt', 32);
  }

  encrypt(plainText: string): string {
    const key = this.deriveKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  decrypt(payload: string): string {
    const key = this.deriveKey();
    const [ivB64, tagB64, dataB64] = payload.split(':');
    if (!ivB64 || !tagB64 || !dataB64) {
      throw new BadRequestException({ code: 'INVALID_ENCRYPTED_DATA', message: 'Dados inválidos.' });
    }
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }
}
