import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListingTile } from '../components/ui/ListingTile';
import { brands, categories } from '../data/mockCategories';
import { useMarketplace } from '../hooks/useMarketplace';
import { Button } from '../components/ui/Button';

export function SearchPage() {
  const [searchParams] = useSearchParams();
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

  return (
    <div className="t2f-page">
      <div className="mb-5 flex flex-wrap items-baseline gap-2 sm:gap-3">
        <h1 className="font-display text-xl font-extrabold tracking-tight sm:text-[1.6rem]">{heading}</h1>
        <span className="font-mono text-sm text-cinza">{results.length} anúncios</span>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 rounded-xl border border-nuvem bg-white p-5 lg:w-64">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-bold">Filtros</h2>
            <button type="button" onClick={clearFilters} className="cursor-pointer border-none bg-transparent text-sm font-semibold text-voo">
              Limpar
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold">
              Categoria
              <select
                value={filters.category}
                onChange={(event) => updateFilters({ category: event.target.value })}
                className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold">
              Marca
              <select
                value={filters.brand}
                onChange={(event) => updateFilters({ brand: event.target.value })}
                className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
              >
                <option value="">Todas</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </label>

            <div>
              <span className="text-sm font-semibold">Condição</span>
              <div className="mt-2 flex gap-2">
                {(['Novo', 'Usado'] as const).map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() =>
                      updateFilters({
                        condition: filters.condition === condition ? '' : condition,
                      })
                    }
                    className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm ${
                      filters.condition === condition
                        ? 'border-altitude bg-altitude text-white'
                        : 'border-nuvem bg-white text-solo'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.escrow}
                onChange={(event) => updateFilters({ escrow: event.target.checked })}
              />
              Apenas com escrow
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm font-semibold">
                Mín (R$)
                <input
                  type="number"
                  value={filters.min}
                  onChange={(event) => updateFilters({ min: event.target.value })}
                  className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
                />
              </label>
              <label className="text-sm font-semibold">
                Máx (R$)
                <input
                  type="number"
                  value={filters.max}
                  onChange={(event) => updateFilters({ max: event.target.value })}
                  className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold">
              Ordenar
              <select
                value={filters.sort}
                onChange={(event) =>
                  updateFilters({ sort: event.target.value as typeof filters.sort })
                }
                className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
              >
                <option value="recentes">Mais recentes</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
              </select>
            </label>
          </div>
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
    </div>
  );
}
