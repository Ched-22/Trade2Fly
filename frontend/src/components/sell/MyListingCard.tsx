import { Link } from 'react-router-dom';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../lib/ordersApi';
import type { Listing } from '../../types/listing';

type MyListingCardProps = {
  listing: Listing;
};

export function MyListingCard({ listing }: MyListingCardProps) {
  const activeOrder = listing.activeOrder;
  const isSaleInProgress = Boolean(activeOrder);
  const isDisputed = activeOrder?.status === 'disputed';
  const isActive = listing.active !== false;
  const cover = listing.coverPhotoUrl ?? listing.imageUrls?.[0];

  const orderStatusLabel =
    activeOrder && activeOrder.status in ORDER_STATUS_LABELS
      ? ORDER_STATUS_LABELS[activeOrder.status as OrderStatus]
      : 'Em andamento';

  const content = (
    <>
      <div
        className="relative mb-3 h-40 rounded-lg bg-cover bg-center"
        style={
          cover
            ? { backgroundImage: `url(${cover})` }
            : { background: listing.grad }
        }
      >
        {isDisputed ? (
          <span className="absolute left-2 top-2 rounded-full bg-error px-2.5 py-1 text-xs font-semibold text-white">
            Em disputa
          </span>
        ) : isSaleInProgress ? (
          <span className="absolute left-2 top-2 rounded-full bg-voo px-2.5 py-1 text-xs font-semibold text-white">
            Venda em andamento
          </span>
        ) : !isActive ? (
          <span className="absolute left-2 top-2 rounded-full bg-solo/80 px-2.5 py-1 text-xs font-semibold text-white">
            Encerrado
          </span>
        ) : null}
      </div>
      <div className="font-mono text-lg font-bold text-pull">{listing.price}</div>
      <div className="line-clamp-2 font-semibold text-solo">{listing.title}</div>
      <div className="mt-1 text-sm text-cinza">{listing.location}</div>
      {isDisputed ? (
        <div className="mt-3 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm leading-snug text-error">
          O comprador abriu uma disputa sobre este produto. Vamos analisar o caso e retornaremos
          com uma resposta em até 48 horas úteis.
        </div>
      ) : null}
      {isSaleInProgress && !isDisputed ? (
        <div className="mt-2 text-sm font-semibold text-voo">
          {orderStatusLabel} · Ir para despacho →
        </div>
      ) : !isDisputed && listing.createdAt ? (
        <div className="mt-2 text-xs text-cinza">
          Publicado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
        </div>
      ) : null}
    </>
  );

  if (isSaleInProgress && activeOrder) {
    return (
      <Link
        to={`/vendas/pedidos/${activeOrder.id}`}
        className={`block rounded-xl border bg-white p-4 transition-colors hover:shadow-sm ${
          isDisputed ? 'border-error/40 hover:border-error/70' : 'border-voo/30 hover:border-voo/60'
        }`}
      >
        {content}
      </Link>
    );
  }

  if (!isActive) {
    return (
      <div className="rounded-xl border border-nuvem bg-white p-4 opacity-90">{content}</div>
    );
  }

  return (
    <Link
      to={`/anuncio/${listing.id}`}
      className="block rounded-xl border border-nuvem bg-white p-4 transition-colors hover:border-voo/40"
    >
      {content}
    </Link>
  );
}
