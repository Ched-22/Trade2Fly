import { BadGatewayException, Injectable } from '@nestjs/common';
import { AsaasConfigService } from './asaas-config.service';

@Injectable()
export class AsaasClientService {
  constructor(private readonly asaasConfig: AsaasConfigService) {}

  private assertConfigured() {
    if (!this.asaasConfig.configured) {
      throw new BadGatewayException({
        code: 'ASAAS_NOT_CONFIGURED',
        message: 'Gateway de pagamento Asaas não configurado.',
      });
    }
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    this.assertConfigured();
    const response = await fetch(`${this.asaasConfig.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        access_token: this.asaasConfig.apiKey!,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const description =
        data?.errors?.[0]?.description ?? `Falha na comunicação com o Asaas (${response.status})`;
      throw new BadGatewayException({ code: 'ASAAS_ERROR', message: description });
    }

    return data as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }
}
