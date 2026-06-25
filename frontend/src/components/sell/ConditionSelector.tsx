import { cn } from '../../lib/cn';
import type { ListingCondition } from '../../types/listingForm';

const CONDITIONS: { value: ListingCondition; label: string; hint: string }[] = [
  { value: 'Novo', label: 'Novo', hint: 'Sem uso ou lacrado' },
  { value: 'Bom', label: 'Bom', hint: 'Usado, em ótimo estado' },
  { value: 'Usado', label: 'Usado', hint: 'Sinais normais de uso' },
];

type ConditionSelectorProps = {
  value: ListingCondition | '';
  onChange: (value: ListingCondition) => void;
  error?: string;
};

export function ConditionSelector({ value, onChange, error }: ConditionSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-solo">Estado do equipamento</span>
      <div className="grid gap-2 sm:grid-cols-3">
        {CONDITIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'cursor-pointer rounded-lg border px-3 py-3 text-left transition-colors',
              value === item.value
                ? 'border-altitude bg-altitude/5 ring-2 ring-altitude/20'
                : 'border-nuvem bg-white hover:border-voo/40',
            )}
          >
            <span className="block font-semibold text-solo">{item.label}</span>
            <span className="mt-0.5 block text-xs text-cinza">{item.hint}</span>
          </button>
        ))}
      </div>
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </div>
  );
}
