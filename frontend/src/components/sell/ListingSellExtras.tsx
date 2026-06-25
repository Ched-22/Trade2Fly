import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

type DraftRestoreBannerProps = {
  onRestore: () => void;
  onDiscard: () => void;
};

export function DraftRestoreBanner({ onRestore, onDiscard }: DraftRestoreBannerProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-voo/30 bg-voo/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-solo">Continuar rascunho?</p>
        <p className="text-sm text-cinza">Encontramos um anúncio não publicado salvo neste dispositivo.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={onRestore}>
          Continuar
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDiscard}>
          Descartar
        </Button>
      </div>
    </div>
  );
}

const linkButtonClass =
  'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-[18px] text-[0.95rem] font-semibold transition-all duration-200';

type ListingSuccessViewProps = {
  title: string;
  listingId: number;
};

export function ListingSuccessView({ title, listingId }: ListingSuccessViewProps) {
  return (
    <div className="t2f-page max-w-2xl text-center">
      <div className="mb-4 text-5xl">🪂</div>
      <h1 className="mb-3 font-display text-3xl font-extrabold">Anúncio publicado!</h1>
      <p className="mb-2 text-cinza">
        <strong className="text-solo">{title}</strong> já está visível para a comunidade Trade2Fly.
      </p>
      <p className="mb-8 text-sm text-cinza">
        As fotos ficam salvas apenas neste dispositivo até a publicação de mídia no servidor.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to={`/anuncio/${listingId}`}
          className={cn(
            linkButtonClass,
            'bg-pull text-white shadow-[0_2px_8px_rgba(255,81,46,0.32)] hover:bg-pull-dark hover:-translate-y-px',
          )}
        >
          Ver anúncio
        </Link>
        <Link
          to="/meus-anuncios"
          className={cn(
            linkButtonClass,
            'border border-nuvem bg-white text-solo hover:border-voo hover:text-voo',
          )}
        >
          Ver meus anúncios
        </Link>
      </div>
    </div>
  );
}
