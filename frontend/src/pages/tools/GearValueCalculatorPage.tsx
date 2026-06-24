import { useMemo, useState } from 'react';
import { ToolPageLayout } from '../../components/tools/ToolPageLayout';
import { ToolResultCard } from '../../components/tools/ToolResultCard';
import { ToolSelect } from '../../components/tools/ToolSelect';
import { Input } from '../../components/ui/Input';
import { brands, categories } from '../../data/mockCategories';
import { formatPrice } from '../../data/mockListings';
import { getToolBySlug } from '../../data/skydiverTools';
import { estimateGearValue } from '../../lib/tools/gearValueEstimate';

const tool = getToolBySlug('calculadora-valor')!;

export function GearValueCalculatorPage() {
  const [category, setCategory] = useState(categories[2]);
  const [brand, setBrand] = useState(brands[0]);
  const [year, setYear] = useState(String(new Date().getFullYear() - 2));
  const [condition, setCondition] = useState<'Novo' | 'Usado'>('Usado');
  const [jumps, setJumps] = useState('300');

  const result = useMemo(() => {
    const y = Number(year);
    if (!y || y < 1990 || y > new Date().getFullYear()) return null;
    const jumpNum = condition === 'Usado' && jumps ? Number(jumps) : undefined;
    return estimateGearValue({
      category,
      brand,
      year: y,
      condition,
      jumps: jumpNum,
    });
  }, [category, brand, year, condition, jumps]);

  const ctaHref = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    const qs = params.toString();
    return qs ? `/busca?${qs}` : '/busca';
  }, [category, brand]);

  return (
    <ToolPageLayout
      title={tool.title}
      description={tool.description}
      ctaHref={ctaHref}
      ctaLabel="Ver anúncios similares"
    >
      <div className="flex flex-col gap-5">
        <ToolSelect label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </ToolSelect>
        <ToolSelect label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)}>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </ToolSelect>
        <Input
          label="Ano"
          type="number"
          min={1990}
          max={new Date().getFullYear()}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <ToolSelect
          label="Condição"
          value={condition}
          onChange={(e) => setCondition(e.target.value as 'Novo' | 'Usado')}
        >
          <option value="Novo">Novo</option>
          <option value="Usado">Usado</option>
        </ToolSelect>
        {condition === 'Usado' ? (
          <Input
            label="Saltos (opcional)"
            type="number"
            min={0}
            value={jumps}
            onChange={(e) => setJumps(e.target.value)}
          />
        ) : null}
      </div>

      {result ? (
        <ToolResultCard title="Faixa estimada">
          <p className="mb-2 text-2xl font-bold text-pull">
            {formatPrice(result.minPrice)} – {formatPrice(result.maxPrice)}
          </p>
          <p className="mb-2 text-sm text-cinza">Estimativa mock — não é avaliação oficial.</p>
          <p>{result.summary}</p>
        </ToolResultCard>
      ) : (
        <p className="mt-6 text-sm text-cinza">Preencha os campos para ver a estimativa.</p>
      )}
    </ToolPageLayout>
  );
}
