import { useMemo, useState } from 'react';
import { ToolPageLayout } from '../../components/tools/ToolPageLayout';
import { ToolResultCard } from '../../components/tools/ToolResultCard';
import { ToolSelect } from '../../components/tools/ToolSelect';
import { Input } from '../../components/ui/Input';
import { getToolBySlug } from '../../data/skydiverTools';
import {
  estimateHarnessSize,
  type ExperienceLevel,
  type FitPreference,
} from '../../lib/tools/harnessSizing';

const tool = getToolBySlug('guia-harness')!;

export function HarnessSizingGuidePage() {
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('75');
  const [experience, setExperience] = useState<ExperienceLevel>('intermediario');
  const [fitPreference, setFitPreference] = useState<FitPreference>('confortavel');

  const result = useMemo(() => {
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!h || !w || h < 140 || h > 220 || w < 40 || w > 150) return null;
    return estimateHarnessSize({
      heightCm: h,
      weightKg: w,
      experience,
      fitPreference,
    });
  }, [heightCm, weightKg, experience, fitPreference]);

  const ctaHref = '/busca?category=Containers';

  return (
    <ToolPageLayout
      title={tool.title}
      description={tool.description}
      ctaHref={ctaHref}
      ctaLabel="Buscar containers"
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Altura (cm)"
          type="number"
          min={140}
          max={220}
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
        />
        <Input
          label="Peso (kg)"
          type="number"
          min={40}
          max={150}
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
        <ToolSelect
          label="Experiência"
          value={experience}
          onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
        >
          <option value="iniciante">Iniciante</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </ToolSelect>
        <ToolSelect
          label="Preferência de ajuste"
          value={fitPreference}
          onChange={(e) => setFitPreference(e.target.value as FitPreference)}
        >
          <option value="justo">Justo</option>
          <option value="confortavel">Confortável</option>
        </ToolSelect>
      </div>

      {result ? (
        <ToolResultCard title={`Tamanho sugerido: ${result.sizeLabel}`}>
          <p>{result.summary}</p>
        </ToolResultCard>
      ) : (
        <p className="mt-6 text-sm text-cinza">Informe altura e peso válidos para ver a sugestão.</p>
      )}
    </ToolPageLayout>
  );
}
