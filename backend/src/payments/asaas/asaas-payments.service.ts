import { Injectable } from '@nestjs/common';
import { AsaasClientService } from './asaas-client.service';
import type {
  AsaasBillingType,
  AsaasCreditCard,
  AsaasCreditCardHolderInfo,
  AsaasCustomer,
  AsaasPayment,
  AsaasPixQrCode,
} from './asaas.types';

export interface CreateChargeInput {
  customerId: string;
  billingType: AsaasBillingType;
  value: number;
  dueDate: string;
  description: string;
  externalReference: string;
  installmentCount?: number;
  installmentValue?: number;
  creditCard?: AsaasCreditCard;
  creditCardHolderInfo?: AsaasCreditCardHolderInfo;
  remoteIp?: string;
}

@Injectable()
export class AsaasPaymentsService {
  constructor(private readonly client: AsaasClientService) {}

  async findCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
    const result = await this.client.get<{ data: AsaasCustomer[] }>(
      `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`,
    );
    return result.data[0] ?? null;
  }

  async createCustomer(input: { name: string; email: string; cpfCnpj: string }): Promise<AsaasCustomer> {
    return this.client.post<AsaasCustomer>('/customers', input);
  }

  async createCharge(input: CreateChargeInput): Promise<AsaasPayment> {
    const { customerId, installmentCount, installmentValue, value, ...rest } = input;
    const body: Record<string, unknown> = { ...rest, customer: customerId };

    if (installmentCount && installmentCount > 1) {
      body.installmentCount = installmentCount;
      body.installmentValue = installmentValue ?? Number((value / installmentCount).toFixed(2));
    } else {
      body.value = value;
    }

    return this.client.post<AsaasPayment>('/payments', body);
  }

  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return this.client.get<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
  }

  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return this.client.get<AsaasPayment>(`/payments/${paymentId}`);
  }

  /**
   * Estorna a cobrança (Pix, cartão ou boleto) via `POST /payments/{id}/refund`.
   * Sem `value` o estorno é integral; com `value` é parcial.
   */
  async refundPayment(paymentId: string, value?: number): Promise<AsaasPayment> {
    return this.client.post<AsaasPayment>(
      `/payments/${paymentId}/refund`,
      value === undefined ? {} : { value },
    );
  }
}
