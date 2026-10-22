import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { SellerPlatformFeeNotice } from './SellerPlatformFeeNotice';
import { PLATFORM_FEE_PERCENT } from '../../lib/platformFee';
import { cn } from '../../lib/cn';
import { getPayoutStatus } from '../../lib/sellerAsaasApi';
import { AuthAlert } from '../auth/AuthAlert';

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
  firstSaleExempt?: boolean;
};

export function ListingSuccessView({
  title,
  listingId,
  firstSaleExempt = false,
}: ListingSuccessViewProps) {
  const [needsPayoutSetup, setNeedsPayoutSetup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPayoutStatus()
      .then((result) => {
        if (!cancelled) setNeedsPayoutSetup(!result.hasPixKey);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="t2f-page max-w-2xl text-center">
      <div className="mb-4 text-5xl">🪂</div>
      <h1 className="mb-3 font-display text-3xl font-extrabold">Anúncio publicado!</h1>
      <p className="mb-2 text-cinza">
        <strong className="text-solo">{title}</strong> já está visível para a comunidade Trade2Fly.
      </p>
      <p className="mb-6 text-sm text-cinza">
        {firstSaleExempt
          ? `Sua primeira venda concluída é isenta da comissão Trade2Fly. A partir da segunda, deduzimos ${PLATFORM_FEE_PERCENT}% na liberação do pagamento. Frete e seguro frete não entram nessa isenção.`
          : `Na conclusão da venda, a Trade2Fly deduz ${PLATFORM_FEE_PERCENT}% de comissão antes de liberar o pagamento a você.`}
      </p>
      {needsPayoutSetup ? (
        <div className="mb-6 text-left">
          <AuthAlert variant="info">
            Você ainda não configurou sua conta de recebimento — sem isso, ninguém consegue comprar seus anúncios.{' '}
            <Link to="/perfil/recebimento" className="font-semibold underline">
              Configurar agora
            </Link>
          </AuthAlert>
        </div>
      ) : null}
      <div className="mb-8">
        <SellerPlatformFeeNotice firstSaleExempt={firstSaleExempt} />
      </div>
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
