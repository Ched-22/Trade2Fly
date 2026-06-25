export const CHECKOUT_PROTECTION_FEE = 45;

export type ParsedLocation = {
  city: string;
  state: string;
};

export type ShippingDestination = {
  cep: string;
  city: string;
  state: string;
};

const STATE_REGION: Record<string, string> = {
  AC: 'norte',
  AL: 'nordeste',
  AP: 'norte',
  AM: 'norte',
  BA: 'nordeste',
  CE: 'nordeste',
  DF: 'centro-oeste',
  ES: 'sudeste',
  GO: 'centro-oeste',
  MA: 'nordeste',
  MT: 'centro-oeste',
  MS: 'centro-oeste',
  MG: 'sudeste',
  PA: 'norte',
  PB: 'nordeste',
  PR: 'sul',
  PE: 'nordeste',
  PI: 'nordeste',
  RJ: 'sudeste',
  RN: 'nordeste',
  RS: 'sul',
  RO: 'norte',
  RR: 'norte',
  SC: 'sul',
  SP: 'sudeste',
  SE: 'nordeste',
  TO: 'norte',
};

const REMOTE_STATES = new Set(['AC', 'AM', 'RR', 'AP', 'PA', 'RO']);

export function parseListingLocation(location: string): ParsedLocation {
  const trimmed = location.trim();
  const match = trimmed.match(/^(.+?),\s*([A-Za-z]{2})$/);
  if (match) {
    return { city: match[1].trim(), state: match[2].toUpperCase() };
  }
  return { city: trimmed, state: '' };
}

export function normalizeCep(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

export function formatCep(digits: string): string {
  const cep = normalizeCep(digits);
  if (cep.length <= 5) return cep;
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

export function isValidCep(digits: string): boolean {
  return normalizeCep(digits).length === 8;
}

export function listingWeightKg(weight: string, category: string): number {
  const parsed = Number(weight);
  if (!weight.trim() || Number.isNaN(parsed) || parsed <= 0) {
    if (category.includes('Sistema')) return 8;
    if (category.includes('Container')) return 3.5;
    if (category.includes('Velame') || category.includes('Reserva')) return 2.2;
    if (category.includes('BASE')) return 4.5;
    return 1.2;
  }
  return parsed > 50 ? parsed / 1000 : parsed;
}

function distanceMultiplier(originState: string, destState: string): number {
  if (!originState || !destState) return 1.5;
  if (originState === destState) return 1;

  const originRegion = STATE_REGION[originState];
  const destRegion = STATE_REGION[destState];
  if (originRegion && destRegion && originRegion === destRegion) return 1.3;

  if (REMOTE_STATES.has(destState) || REMOTE_STATES.has(originState)) return 2.15;
  return 1.7;
}

function bulkyMultiplier(category: string): number {
  if (category.includes('Sistema') || category.includes('BASE')) return 1.2;
  if (category.includes('Container')) return 1.12;
  return 1;
}

export function estimateShippingCost(params: {
  origin: ParsedLocation;
  destination: ShippingDestination;
  weightKg: number;
  category: string;
}): number {
  const { origin, destination, weightKg, category } = params;
  if (!destination.state || !isValidCep(destination.cep)) return 0;

  const base = 42;
  const perKg = 7.5;
  const multiplier = distanceMultiplier(origin.state, destination.state.toUpperCase());
  const bulky = bulkyMultiplier(category);
  const sameCityBonus =
    origin.city &&
    destination.city &&
    origin.city.localeCompare(destination.city, 'pt-BR', { sensitivity: 'base' }) === 0
      ? 0.88
      : 1;

  const raw = (base + weightKg * perKg) * multiplier * bulky * sameCityBonus;
  return Math.max(29, Math.round(raw));
}
