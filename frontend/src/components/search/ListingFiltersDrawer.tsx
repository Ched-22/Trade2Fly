import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Filters } from '../../types/listing';
import { Button } from '../ui/Button';
import { ListingFiltersForm } from './ListingFiltersForm';

type ListingFiltersDrawerProps = {
  open: boolean;
  filters: Filters;
  resultCount: number;
  onUpdate: (patch: Partial<Filters>) => void;
  onClear: () => void;
  onClose: () => void;
};

export function ListingFiltersDrawer({
  open,
  filters,
  resultCount,
  onUpdate,
  onClear,
  onClose,
}: ListingFiltersDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filters-drawer-title">
      <button
        type="button"
        aria-label="Fechar filtros"
        className="absolute inset-0 cursor-pointer border-none bg-solo/40"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-2xl border border-nuvem bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-nuvem px-4 py-4">
          <h2 id="filters-drawer-title" className="font-display text-lg font-bold">
            Filtros
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClear}
              className="cursor-pointer border-none bg-transparent text-sm font-semibold text-voo"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-nuvem bg-white text-solo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ListingFiltersForm filters={filters} onUpdate={onUpdate} />
        </div>

        <div className="shrink-0 border-t border-nuvem p-4">
          <Button className="w-full" size="lg" onClick={onClose}>
            Ver {resultCount} anúncio{resultCount === 1 ? '' : 's'}
          </Button>
        </div>
      </div>
    </div>
  );
}
