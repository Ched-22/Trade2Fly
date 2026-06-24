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
      className="group flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border border-nuvem bg-white p-3 text-left shadow-sm transition-all duration-200 hover:border-solo/15 hover:shadow-[0_4px_14px_rgba(10,27,42,0.06)] sm:gap-3.5 sm:p-3.5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-nuvem bg-bruma text-solo transition-colors group-hover:border-solo/10 group-hover:bg-white">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-sm font-bold text-solo">{card.name}</h3>
        <p className="mt-0.5 truncate text-xs text-cinza">{card.description}</p>
        <p className="mt-1 text-[11px] font-medium text-cinza/90">
          {listingCount !== undefined ? `${listingCount} anúncios` : 'Ver anúncios'}
        </p>
      </div>

      <ArrowRight
        className="h-4 w-4 shrink-0 text-cinza transition-all group-hover:translate-x-0.5 group-hover:text-solo"
        strokeWidth={1.75}
      />
    </button>
  );
}
