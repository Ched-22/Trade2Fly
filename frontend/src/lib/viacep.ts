import { normalizeCep } from './shippingEstimate';

export type ViaCepAddress = {
  cep: string;
  city: string;
  state: string;
  street: string;
  district: string;
};

type ViaCepResponse = {
  erro?: boolean;
  localidade?: string;
  uf?: string;
  logradouro?: string;
  bairro?: string;
};

export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress | null> {
  const digits = normalizeCep(cep);
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) return null;

  const data = (await response.json()) as ViaCepResponse;
  if (data.erro || !data.localidade || !data.uf) return null;

  return {
    cep: digits,
    city: data.localidade,
    state: data.uf,
    street: data.logradouro ?? '',
    district: data.bairro ?? '',
  };
}
