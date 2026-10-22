import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsaasConfigService {
  constructor(private readonly config: ConfigService) {}

  get apiKey(): string | undefined {
    return this.config.get<string>('ASAAS_API_KEY');
  }

  get webhookToken(): string | undefined {
    return this.config.get<string>('ASAAS_WEBHOOK_TOKEN');
  }

  /** Asaas encodes the environment in the key itself ($aact_hmlg_... vs $aact_prod_...). */
  get baseUrl(): string {
    return this.apiKey?.includes('_hmlg_')
      ? 'https://api-sandbox.asaas.com/v3'
      : 'https://api.asaas.com/v3';
  }

  get configured(): boolean {
    return Boolean(this.apiKey?.trim());
  }
}
