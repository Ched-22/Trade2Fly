import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PackageSpec, toLoggiMoney } from './package-spec';

type LoggiMoney = {
  currencyCode: string;
  units: number | string;
  nanos: number;
};

type LoggiQuotation = {
  price: {
    totalAmount: LoggiMoney;
  };
  sloInDays?: number;
  freightType?: string;
  freightTypeLabel?: string;
};

type LoggiQuoteResponse = {
  packagesQuotations?: Array<{
    quotations?: LoggiQuotation[];
  }>;
};

export type LoggiQuoteResult = {
  amount: number;
  estimatedDays: number | null;
  freightType: string | null;
  freightTypeLabel: string | null;
};

type CachedToken = {
  idToken: string;
  expiresAt: number;
};

@Injectable()
export class LoggiService {
  private readonly logger = new Logger(LoggiService.name);
  private cachedToken: CachedToken | null = null;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('LOGGI_CLIENT_ID') &&
        this.config.get<string>('LOGGI_CLIENT_SECRET') &&
        this.config.get<string>('LOGGI_COMPANY_ID'),
    );
  }

  private apiBaseUrl(): string {
    return (this.config.get<string>('LOGGI_API_URL') ?? 'https://api.loggi.com').replace(/\/$/, '');
  }

  private parseMoney(amount: LoggiMoney): number {
    const units = Number(amount.units);
    const nanos = Number(amount.nanos ?? 0);
    return units + nanos / 1_000_000_000;
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 60_000) {
      return this.cachedToken.idToken;
    }

    const clientId = this.config.get<string>('LOGGI_CLIENT_ID');
    const clientSecret = this.config.get<string>('LOGGI_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new Error('Loggi credentials are not configured');
    }

    const response = await fetch(`${this.apiBaseUrl()}/v2/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Loggi auth failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { idToken: string; expiresIn?: string | number };
    const expiresInSeconds = Number(data.expiresIn ?? 3600);
    this.cachedToken = {
      idToken: data.idToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    };

    return data.idToken;
  }

  async quote(params: {
    origin: { cep: string; city: string; state: string };
    destination: { cep: string; city: string; state: string };
    packageSpec: PackageSpec;
    goodsValue: number;
  }): Promise<LoggiQuoteResult | null> {
    if (!this.isConfigured()) return null;

    const companyId = this.config.get<string>('LOGGI_COMPANY_ID');
    if (!companyId) return null;

    const token = await this.getAccessToken();
    const pickupType = this.config.get<string>('LOGGI_PICKUP_TYPE') ?? 'PICKUP_TYPE_SPOT';

    const payload = {
      shipFrom: {
        lines: {
          addressLine1: 'Centro',
          postalCode: params.origin.cep,
          city: params.origin.city,
          state: params.origin.state,
          country: 'Brasil',
        },
      },
      shipTo: {
        lines: {
          addressLine1: 'Entrega',
          postalCode: params.destination.cep,
          city: params.destination.city,
          state: params.destination.state,
          country: 'Brasil',
        },
      },
      packages: [
        {
          weightG: params.packageSpec.weightG,
          lengthCm: params.packageSpec.lengthCm,
          widthCm: params.packageSpec.widthCm,
          heightCm: params.packageSpec.heightCm,
          goodsValue: toLoggiMoney(params.goodsValue),
        },
      ],
      pickupTypes: [pickupType],
    };

    const response = await fetch(
      `${this.apiBaseUrl()}/v1/companies/${companyId}/quotations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Loggi quote failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as LoggiQuoteResponse;
    const quotations = data.packagesQuotations?.[0]?.quotations ?? [];
    if (quotations.length === 0) return null;

    const selected = [...quotations].sort(
      (a, b) => this.parseMoney(a.price.totalAmount) - this.parseMoney(b.price.totalAmount),
    )[0];

    return {
      amount: Math.round(this.parseMoney(selected.price.totalAmount) * 100) / 100,
      estimatedDays: selected.sloInDays ?? null,
      freightType: selected.freightType ?? null,
      freightTypeLabel: selected.freightTypeLabel ?? null,
    };
  }
}
