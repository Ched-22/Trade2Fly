import { useMemo, useState } from 'react';
import { ToolPageLayout } from '../../components/tools/ToolPageLayout';
import { ToolResultCard } from '../../components/tools/ToolResultCard';
import { Input } from '../../components/ui/Input';
import { getToolBySlug } from '../../data/skydiverTools';
import { calculateWingLoading } from '../../lib/tools/wingLoading';

const tool = getToolBySlug('wingloading')!;

export function WingLoadingCalculatorPage() {
  const [weightKg, setWeightKg] = useState('85');
  const [canopySqft, setCanopySqft] = useState('190');

  const result = useMemo(() => {
    const w = Number(weightKg);
    const c = Number(canopySqft);
    if (!w || !c || w < 40 || c < 80 || c > 350) return null;
    return calculateWingLoading({ weightKg: w, canopySqft: c });
  }, [weightKg, canopySqft]);

  return (
    <ToolPageLayout
      title={tool.title}
      description={tool.description}
      ctaHref="/busca?category=Velames"
      ctaLabel="Buscar velames"
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Peso total sob carga (kg)"
          type="number"
          min={40}
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
        <Input
          label="Tamanho do velame (sqft)"
          type="number"
          min={80}
          max={350}
          value={canopySqft}
          onChange={(e) => setCanopySqft(e.target.value)}
        />
      </div>

      {result ? (
        <ToolResultCard title={result.bandLabel} accent={result.band}>
          <p className="mb-2 text-2xl font-bold">
            {result.wlLbFt2.toFixed(2)} lb/ft²
            <span className="ml-2 text-base font-normal text-cinza">
              ({result.wlKgM2.toFixed(1)} kg/m²)
            </span>
          </p>
          <p>{result.summary}</p>
        </ToolResultCard>
      ) : (
        <p className="mt-6 text-sm text-cinza">Informe peso e tamanho do velame válidos.</p>
      )}
    </ToolPageLayout>
  );
}
