export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export function normalizePixKey(pixKey: string, pixKeyType: PixKeyType): string {
  const trimmed = pixKey.trim();
  if (pixKeyType === 'email') return trimmed.toLowerCase();
  if (pixKeyType === 'phone' || pixKeyType === 'cpf' || pixKeyType === 'cnpj') {
    return trimmed.replace(/\D/g, '');
  }
  return trimmed;
}

export function validatePixKey(pixKey: string, pixKeyType: PixKeyType): boolean {
  const value = normalizePixKey(pixKey, pixKeyType);
  switch (pixKeyType) {
    case 'cpf':
      return /^\d{11}$/.test(value);
    case 'cnpj':
      return /^\d{14}$/.test(value);
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'phone':
      return /^\d{10,13}$/.test(value);
    case 'random':
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    default:
      return false;
  }
}

export function maskPixKey(pixKey: string, pixKeyType: PixKeyType): string {
  const value = normalizePixKey(pixKey, pixKeyType);
  switch (pixKeyType) {
    case 'email': {
      const [local, domain] = value.split('@');
      if (!domain) return '***';
      const visible = local.slice(0, Math.min(2, local.length));
      return `${visible}***@${domain}`;
    }
    case 'cpf':
      return `***.${value.slice(3, 6)}.${value.slice(6, 9)}-**`;
    case 'cnpj':
      return `**.${value.slice(2, 5)}.${value.slice(5, 8)}/****-**`;
    case 'phone':
      return `(${value.slice(0, 2)}) *****-${value.slice(-4)}`;
    case 'random':
      return `${value.slice(0, 4)}…${value.slice(-4)}`;
    default:
      return '***';
  }
}

export function formatPixKeyDisplay(pixKey: string, pixKeyType: PixKeyType): string {
  const value = normalizePixKey(pixKey, pixKeyType);
  if (pixKeyType === 'cpf' && value.length === 11) {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (pixKeyType === 'cnpj' && value.length === 14) {
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  if (pixKeyType === 'phone' && value.length >= 10) {
    const ddd = value.slice(0, 2);
    const rest = value.slice(2);
    return rest.length === 9
      ? `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
      : `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return value;
}
