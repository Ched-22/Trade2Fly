import { brands, categories } from '../../data/mockCategories';
import type { Filters } from '../../types/listing';

type ListingFiltersFormProps = {
  filters: Filters;
  onUpdate: (patch: Partial<Filters>) => void;
};

export function ListingFiltersForm({ filters, onUpdate }: ListingFiltersFormProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold">
        Categoria
        <select
          value={filters.category}
          onChange={(event) => onUpdate({ category: event.target.value })}
          className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-semibold">
        Marca
        <select
          value={filters.brand}
          onChange={(event) => onUpdate({ brand: event.target.value })}
          className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
        >
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="text-sm font-semibold">Condição</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['Novo', 'Bom', 'Usado'] as const).map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() =>
                onUpdate({
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
          onChange={(event) => onUpdate({ escrow: event.target.checked })}
        />
        Apenas com pagamento protegido
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm font-semibold">
          Mín (R$)
          <input
            type="number"
            value={filters.min}
            onChange={(event) => onUpdate({ min: event.target.value })}
            className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
          />
        </label>
        <label className="text-sm font-semibold">
          Máx (R$)
          <input
            type="number"
            value={filters.max}
            onChange={(event) => onUpdate({ max: event.target.value })}
            className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold">
        Ordenar
        <select
          value={filters.sort}
          onChange={(event) => onUpdate({ sort: event.target.value as Filters['sort'] })}
          className="mt-1 w-full rounded-md border border-nuvem px-3 py-2"
        >
          <option value="recentes">Mais recentes</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </select>
      </label>
    </div>
  );
}
