export type ContainerSizingInput = {
  mainSqft: number;
  reserveSqft: number;
  hasAad: boolean;
};

export type ContainerSizeLabel = 'pequeno' | 'medio' | 'grande';

export type ContainerSizingResult = {
  sizeLabel: ContainerSizeLabel;
  sizeTitle: string;
  summary: string;
  packNote: string;
};

export function estimateContainerSize(input: ContainerSizingInput): ContainerSizingResult {
  const packVolume = input.mainSqft + input.reserveSqft * 0.6 + (input.hasAad ? 25 : 0);

  let sizeLabel: ContainerSizeLabel;
  let sizeTitle: string;
  let packNote: string;

  if (packVolume < 200) {
    sizeLabel = 'pequeno';
    sizeTitle = 'Pequeno (S)';
    packNote = 'Volume de pack enxuto — ideal para mains até ~170 sqft e reservas compactas.';
  } else if (packVolume < 280) {
    sizeLabel = 'medio';
    sizeTitle = 'Médio (M)';
    packNote = 'Faixa mais comum — acomoda mains 170–210 sqft com reserva padrão.';
  } else {
    sizeLabel = 'grande';
    sizeTitle = 'Grande (L/XL)';
    packNote = 'Mais volume para mains 210+ sqft, reservas grandes ou AAD.';
  }

  return {
    sizeLabel,
    sizeTitle,
    summary: `Main ${input.mainSqft} sqft + reserva ${input.reserveSqft} sqft${input.hasAad ? ' com AAD' : ''} → container ${sizeTitle}.`,
    packNote,
  };
}
