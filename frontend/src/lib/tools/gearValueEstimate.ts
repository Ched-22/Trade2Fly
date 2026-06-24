import { listings, formatPrice } from '../../data/mockListings';

export type GearValueInput = {
  category: string;
  brand: string;
  year: number;
  condition: 'Novo' | 'Usado';
  jumps?: number;
};

export type GearValueResult = {
  minPrice: number;
  maxPrice: number;
  midPrice: number;
  summary: string;
};

const categoryBasePrices: Record<string, number> = (() => {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const listing of listings) {
    const entry = totals.get(listing.category) ?? { sum: 0, count: 0 };
    entry.sum += listing.priceNum;
    entry.count += 1;
    totals.set(listing.category, entry);
  }
  const bases: Record<string, number> = {};
  for (const [category, { sum, count }] of totals) {
    const avg = sum / count;
    bases[category] = Math.round(avg / 100) * 100;
  }
  return bases;
})();

const defaultBase = 5000;

export function estimateGearValue(input: GearValueInput): GearValueResult {
  const base = categoryBasePrices[input.category] ?? defaultBase;
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - input.year);

  let adjusted = base;

  if (input.condition === 'Novo') {
    adjusted *= 1.1;
  } else {
    adjusted *= 0.92 ** age;
    if (input.jumps !== undefined && input.jumps > 0) {
      const jumpPenalty = Math.min(input.jumps / 500, 0.25);
      adjusted *= 1 - jumpPenalty;
    }
  }

  if (input.brand === 'PD' || input.brand === 'UPT') {
    adjusted *= 1.05;
  }

  const midPrice = Math.round(adjusted / 100) * 100;
  const minPrice = Math.round((midPrice * 0.85) / 100) * 100;
  const maxPrice = Math.round((midPrice * 1.15) / 100) * 100;

  return {
    minPrice,
    maxPrice,
    midPrice,
    summary: `Estimativa para ${input.category} (${input.brand}, ${input.year}, ${input.condition.toLowerCase()}): ${formatPrice(minPrice)} – ${formatPrice(maxPrice)} (referência ${formatPrice(midPrice)}).`,
  };
}

export { categoryBasePrices };
