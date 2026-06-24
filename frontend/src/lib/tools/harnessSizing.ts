export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado';
export type FitPreference = 'justo' | 'confortavel';

export type HarnessSizingInput = {
  heightCm: number;
  weightKg: number;
  experience: ExperienceLevel;
  fitPreference: FitPreference;
};

export type HarnessSizingResult = {
  sizeLabel: string;
  summary: string;
};

export function estimateHarnessSize(input: HarnessSizingInput): HarnessSizingResult {
  const { heightCm, weightKg, experience, fitPreference } = input;
  const bmiProxy = weightKg / ((heightCm / 100) ** 2);

  let sizeScore = 0;
  if (weightKg < 62) sizeScore = 1;
  else if (weightKg < 75) sizeScore = 2;
  else if (weightKg < 90) sizeScore = 3;
  else sizeScore = 4;

  if (heightCm < 165) sizeScore -= 1;
  if (heightCm > 185) sizeScore += 1;

  if (experience === 'iniciante') sizeScore += 0;
  else if (experience === 'intermediario') sizeScore += 0.5;
  else sizeScore += 1;

  if (fitPreference === 'confortavel') sizeScore += 0.5;

  const sizes = ['XS', 'S', 'M', 'L', 'XL'] as const;
  const index = Math.min(Math.max(Math.round(sizeScore), 0), sizes.length - 1);
  const sizeLabel = sizes[index];

  const fitNote =
    fitPreference === 'justo'
      ? 'Ajuste mais próximo ao corpo — comum em wingsuit ou competição.'
      : 'Ajuste com folga para conforto em saltos longos.';

  const expNote =
    experience === 'iniciante'
      ? 'Para iniciantes, priorize mobilidade e ajuste com ajuda de um rigger.'
      : 'Combine esta sugestão com a tabela do fabricante do seu container.';

  return {
    sizeLabel,
    summary: `Com base em ${heightCm} cm, ${weightKg} kg (índice ${bmiProxy.toFixed(1)}), sugerimos tamanho ${sizeLabel}. ${fitNote} ${expNote}`,
  };
}
