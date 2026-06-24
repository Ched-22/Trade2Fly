import { useMemo, useState } from 'react';
import { ToolPageLayout } from '../../components/tools/ToolPageLayout';
import { ToolResultCard } from '../../components/tools/ToolResultCard';
import { ToolSelect } from '../../components/tools/ToolSelect';
import { Input } from '../../components/ui/Input';
import { getToolBySlug } from '../../data/skydiverTools';
import { estimateContainerSize } from '../../lib/tools/containerSizing';

const tool = getToolBySlug('guia-container')!;

export function ContainerSizingGuidePage() {
  const [mainSqft, setMainSqft] = useState('190');
  const [reserveSqft, setReserveSqft] = useState('176');
  const [hasAad, setHasAad] = useState('sim');

  const result = useMemo(() => {
    const main = Number(mainSqft);
    const reserve = Number(reserveSqft);
    if (!main || !reserve || main < 100 || reserve < 100) return null;
    return estimateContainerSize({
      mainSqft: main,
      reserveSqft: reserve,
      hasAad: hasAad === 'sim',
    });
  }, [mainSqft, reserveSqft, hasAad]);

  return (
    <ToolPageLayout
      title={tool.title}
      description={tool.description}
      ctaHref="/busca?category=Containers"
      ctaLabel="Buscar containers"
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Tamanho main (sqft)"
          type="number"
          min={100}
          value={mainSqft}
          onChange={(e) => setMainSqft(e.target.value)}
        />
        <Input
          label="Tamanho reserva (sqft)"
          type="number"
          min={100}
          value={reserveSqft}
          onChange={(e) => setReserveSqft(e.target.value)}
        />
        <ToolSelect label="AAD" value={hasAad} onChange={(e) => setHasAad(e.target.value)}>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </ToolSelect>
      </div>

      {result ? (
        <ToolResultCard title={result.sizeTitle}>
          <p className="mb-2">{result.summary}</p>
          <p className="text-cinza">{result.packNote}</p>
        </ToolResultCard>
      ) : (
        <p className="mt-6 text-sm text-cinza">Informe tamanhos válidos de main e reserva.</p>
      )}
    </ToolPageLayout>
  );
}
