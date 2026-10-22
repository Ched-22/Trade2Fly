export type PackageSpec = {
  weightG: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export function listingWeightKg(weight: string | null | undefined, category: string): number {
  const parsed = Number(weight);
  if (!weight?.trim() || Number.isNaN(parsed) || parsed <= 0) {
    if (category.includes('Sistema')) return 8;
    if (category.includes('Container')) return 3.5;
    if (category.includes('Velame') || category.includes('Reserva')) return 2.2;
    if (category.includes('BASE')) return 4.5;
    return 1.2;
  }
  return parsed > 50 ? parsed / 1000 : parsed;
}

export function packageSpecForListing(params: {
  weight?: string | null;
  category: string;
}): PackageSpec {
  const weightKg = listingWeightKg(params.weight, params.category);
  const weightG = Math.max(100, Math.round(weightKg * 1000));

  if (params.category.includes('Sistema') || params.category.includes('BASE')) {
    return { weightG, lengthCm: 55, widthCm: 45, heightCm: 35 };
  }
  if (params.category.includes('Container')) {
    return { weightG, lengthCm: 45, widthCm: 35, heightCm: 25 };
  }
  if (params.category.includes('Velame') || params.category.includes('Reserva')) {
    return { weightG, lengthCm: 40, widthCm: 30, heightCm: 20 };
  }
  return { weightG, lengthCm: 30, widthCm: 25, heightCm: 15 };
}

export function toLoggiMoney(value: number) {
  const units = Math.floor(value);
  const nanos = Math.round((value - units) * 1_000_000_000);
  return { currencyCode: 'BRL', units, nanos };
}
