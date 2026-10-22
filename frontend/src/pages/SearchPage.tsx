import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListingFiltersDrawer } from '../components/search/ListingFiltersDrawer';
import { ListingFiltersForm } from '../components/search/ListingFiltersForm';
import { ListingTile } from '../components/ui/ListingTile';
import { useMarketplace } from '../hooks/useMarketplace';
import { countActiveFilters } from '../lib/filterUtils';
import { Button } from '../components/ui/Button';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    query,
    setQuery,
    filters,
    updateFilters,
    clearFilters,
    filteredListings,
    favorites,
    toggleFavorite,
  } = useMarketplace();

  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const sort = searchParams.get('sort');
    const escrow = searchParams.get('escrow');

    if (q !== null) setQuery(q);

    const patch: Partial<typeof filters> = {};
    if (category !== null) patch.category = category;
    if (brand !== null) patch.brand = brand;
    if (sort === 'newest') patch.sort = 'recentes';
    if (escrow === 'true') patch.escrow = true;

    if (Object.keys(patch).length > 0) {
      updateFilters(patch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const heading = filters.category
    ? filters.category
    : filters.brand
      ? `Marca: ${filters.brand}`
      : query
        ? `Resultados para "${query}"`
        : 'Todos os anúncios';

  const results = filteredListings.map((listing) => ({
    ...listing,
    fav: !!favorites[listing.id],
  }));

  const activeFilterCount = countActiveFilters(filters);
  const sortLabel =
    filters.sort === 'menor'
      ? 'Menor preço'
      : filters.sort === 'maior'
        ? 'Maior preço'
        : 'Recentes';

  return (
    <div className="t2f-page">
      <div className="mb-4 flex flex-wrap items-baseline gap-2 sm:mb-5 sm:gap-3">
        <h1 className="font-display text-xl font-extrabold tracking-tight sm:text-[1.6rem]">{heading}</h1>
        <span className="font-mono text-sm text-cinza">{results.length} anúncios</span>
      </div>

      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-label="Abrir filtros"
          className={`relative flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
            activeFilterCount > 0
              ? 'border-voo bg-voo-light text-voo'
              : 'border-nuvem bg-white text-solo'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0" />
          Filtros
          {activeFilterCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-voo px-1.5 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-label="Ordenar resultados"
          className={`flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
            filters.sort !== 'recentes'
              ? 'border-voo bg-voo-light text-voo'
              : 'border-nuvem bg-white text-solo'
          }`}
        >
          <ArrowUpDown className="h-4 w-4 shrink-0" />
          {sortLabel}
        </button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-64 shrink-0 rounded-xl border border-nuvem bg-white p-5 lg:block">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-bold">Filtros</h2>
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer border-none bg-transparent text-sm font-semibold text-voo"
            >
              Limpar
            </button>
          </div>

          <ListingFiltersForm filters={filters} onUpdate={updateFilters} />
        </aside>

        <div className="flex-1">
          {results.length > 0 ? (
            <div className="t2f-grid">
              {results.map((listing) => (
                <ListingTile key={listing.id} listing={listing} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-nuvem bg-white p-12 text-center">
              <p className="mb-4 text-cinza">Nenhum anúncio encontrado com esses filtros.</p>
              <Button variant="secondary" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      <ListingFiltersDrawer
        open={filtersOpen}
        filters={filters}
        resultCount={results.length}
        onUpdate={updateFilters}
        onClear={clearFilters}
        onClose={() => setFiltersOpen(false)}
      />
    </div>
  );
}
