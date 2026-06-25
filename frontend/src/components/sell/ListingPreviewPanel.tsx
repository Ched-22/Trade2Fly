import { MapPin, Shield } from 'lucide-react';
import { buildSpecsString } from '../../lib/buildListingPayload';
import type { ListingFormState } from '../../types/listingForm';
import { Badge } from '../ui/Badge';

const FALLBACK_GRAD = 'linear-gradient(150deg, #0D2B45, #2D7DD2 55%, #3a8ee0)';

type ListingPreviewPanelProps = {
  form: ListingFormState;
  className?: string;
};

function formatPrice(value: string): string {
  const num = Number(value);
  if (!value.trim() || Number.isNaN(num)) return 'R$ —';
  return `R$ ${num.toLocaleString('pt-BR')}`;
}

function resolveBrand(form: ListingFormState): string {
  if (form.brand === '__other__') return form.brandOther.trim() || 'Marca';
  return form.brand || 'Marca';
}

export function ListingPreviewPanel({ form, className }: ListingPreviewPanelProps) {
  const coverPhoto = form.photos[0]?.previewUrl;
  const specs = form.category ? buildSpecsString(form) : '';
  const brandLine = resolveBrand(form);

  return (
    <aside
      className={`h-fit rounded-xl border border-nuvem bg-white p-5 shadow-sm ${className ?? ''}`}
    >
      <h2 className="mb-4 font-display font-bold text-solo">Pré-visualização</h2>
      <article className="overflow-hidden rounded-lg border border-nuvem">
        <div
          className="relative h-40 bg-cover bg-center"
          style={
            coverPhoto
              ? { backgroundImage: `url(${coverPhoto})` }
              : { background: FALLBACK_GRAD }
          }
        >
          <Badge variant="escrow" className="absolute top-3 left-3">
            <Shield className="mr-1 inline h-3 w-3" />
            Escrow
          </Badge>
          {form.condition ? (
            <span className="absolute top-3 right-3 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-solo">
              {form.condition}
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <div className="mb-1 font-mono text-lg font-bold text-pull">
            {formatPrice(form.priceNum)}
          </div>
          <h3 className="mb-1 line-clamp-2 font-display text-base font-bold text-solo">
            {form.title.trim() || 'Título do anúncio'}
          </h3>
          {form.category ? (
            <p className="mb-2 text-xs font-medium text-voo">{form.category}</p>
          ) : null}
          <p className="mb-2 font-mono text-xs tracking-wide text-cinza">
            {specs || `${brandLine} · detalhes do equipamento`}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-cinza">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {form.location.trim() || 'Localização'}
          </div>
        </div>
      </article>
    </aside>
  );
}
