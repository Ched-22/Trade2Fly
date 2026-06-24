import { Backpack, Gauge, HardHat, Package, Shield, Wind, type LucideIcon } from 'lucide-react';
import { type CategoryCardData, type CategoryIconKey } from '../../data/mockCategories';

const categoryIconMap: Record<CategoryIconKey, LucideIcon> = {
  wind: Wind,
  backpack: Backpack,
  shield: Shield,
  package: Package,
  hardHat: HardHat,
  gauge: Gauge,
};

type CategoryPillProps = {
  card: CategoryCardData;
  onClick: () => void;
};

export function CategoryPill({ card, onClick }: CategoryPillProps) {
  const Icon = categoryIconMap[card.icon];
  const label = card.pillLabel ?? card.name;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-bruma py-2 pr-2 pl-3 text-left transition-colors hover:bg-nuvem/70"
    >
      <span className="font-display text-[13px] leading-none font-bold text-solo">{label}</span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
        <Icon className="h-3.5 w-3.5 text-solo" strokeWidth={1.75} />
      </span>
    </button>
  );
}
