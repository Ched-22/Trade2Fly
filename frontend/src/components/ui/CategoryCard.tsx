import { ArrowRight, Backpack, Gauge, HardHat, Package, Shield, Wind, type LucideIcon } from 'lucide-react';
import { type CategoryCardData, type CategoryIconKey } from '../../data/mockCategories';

const categoryIconMap: Record<CategoryIconKey, LucideIcon> = {
  wind: Wind,
  backpack: Backpack,
  shield: Shield,
  package: Package,
  hardHat: HardHat,
  gauge: Gauge,
};

type CategoryCardProps = {
  card: CategoryCardData;
  listingCount?: number;
  onClick: () => void;
};

export function CategoryCard({ card, listingCount, onClick }: CategoryCardProps) {
  const Icon = categoryIconMap[card.icon];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-lg border border-nuvem bg-white p-4 text-left transition-colors duration-200 hover:border-solo hover:bg-solo sm:p-5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bruma text-solo transition-colors group-hover:bg-pull group-hover:text-white">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-[1.2rem] font-bold text-solo transition-colors group-hover:text-white">{card.name}</h3>
        <p className="mt-0.5 truncate text-xs text-cinza transition-colors group-hover:text-white/70">{card.description}</p>
        <p className="mt-2 t2f-eyebrow text-[0.6rem] text-cinza transition-colors group-hover:text-pull">
          {listingCount !== undefined ? `${listingCount} anúncios` : 'Ver anúncios'}
        </p>
      </div>

      <ArrowRight
        className="h-4 w-4 shrink-0 text-cinza transition-all group-hover:translate-x-1 group-hover:text-white"
        strokeWidth={1.75}
      />
    </button>
  );
}
