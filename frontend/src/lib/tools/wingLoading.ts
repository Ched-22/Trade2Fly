export type WingLoadingInput = {
  weightKg: number;
  canopySqft: number;
};

export type WingLoadingBand = 'conservador' | 'moderado' | 'agressivo';

export type WingLoadingResult = {
  wlLbFt2: number;
  wlKgM2: number;
  band: WingLoadingBand;
  bandLabel: string;
  summary: string;
};

export function calculateWingLoading(input: WingLoadingInput): WingLoadingResult {
  const wlLbFt2 = (input.weightKg * 2.20462) / input.canopySqft;
  const wlKgM2 = input.weightKg / (input.canopySqft * 0.092903);

  let band: WingLoadingBand;
  let bandLabel: string;

  if (wlLbFt2 < 1.0) {
    band = 'conservador';
    bandLabel = 'Conservador';
  } else if (wlLbFt2 <= 1.4) {
    band = 'moderado';
    bandLabel = 'Moderado';
  } else {
    band = 'agressivo';
    bandLabel = 'Agressivo';
  }

  return {
    wlLbFt2,
    wlKgM2,
    band,
    bandLabel,
    summary: `Wing loading de ${wlLbFt2.toFixed(2)} lb/ft² (${wlKgM2.toFixed(1)} kg/m²) — perfil ${bandLabel} para este velame.`,
  };
}
