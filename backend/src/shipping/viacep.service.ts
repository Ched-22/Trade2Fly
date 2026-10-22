import { Injectable, Logger } from '@nestjs/common';

type ViaCepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

@Injectable()
export class ViaCepService {
  private readonly logger = new Logger(ViaCepService.name);

  normalizeCep(value: string): string {
    return value.replace(/\D/g, '').slice(0, 8);
  }

  async fetchByCep(cep: string): Promise<ViaCepAddress | null> {
    const digits = this.normalizeCep(cep);
    if (digits.length !== 8) return null;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) return null;
      const data = (await response.json()) as ViaCepAddress;
      if (data.erro) return null;
      return data;
    } catch (error) {
      this.logger.warn(`ViaCEP lookup failed for ${digits}: ${String(error)}`);
      return null;
    }
  }

  async findCityCep(state: string, city: string): Promise<string | null> {
    const uf = state.trim().toUpperCase();
    const cityName = city.trim();
    if (!uf || uf.length !== 2 || !cityName) return null;

    try {
      const url = `https://viacep.com.br/ws/${encodeURIComponent(uf)}/${encodeURIComponent(cityName)}/Centro/json/`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = (await response.json()) as ViaCepAddress[] | { erro?: boolean };
      if (!Array.isArray(data) || data.length === 0) return null;
      return this.normalizeCep(data[0].cep);
    } catch (error) {
      this.logger.warn(`ViaCEP city lookup failed for ${cityName}/${uf}: ${String(error)}`);
      return null;
    }
  }
}
