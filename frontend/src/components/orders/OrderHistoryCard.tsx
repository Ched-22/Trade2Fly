import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/priceFormat';
import { ORDER_STATUS_LABELS, type OrderListItem } from '../../lib/ordersApi';

type OrderHistoryCardProps = {
  order: OrderListItem;
  to: string;
  subtitle?: string;
};

export function OrderHistoryCard({ order, to, subtitle }: OrderHistoryCardProps) {
  return (
    <Link
      to={to}
      className="flex flex-wrap items-center gap-4 rounded-xl border border-nuvem bg-white p-4 transition-colors hover:border-pull/40"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-bruma text-2xl">
        {order.listing.imageUrl ? (
          <img
            src={order.listing.imageUrl}
            alt=""
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          '🪂'
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold">{order.listing.title}</div>
        {subtitle ? <div className="text-sm text-cinza">{subtitle}</div> : null}
        <div className="font-mono text-sm text-pull">{formatPrice(order.amount)}</div>
        <div className="text-sm text-cinza">
          {order.completedAt
            ? `Concluído em ${new Date(order.completedAt).toLocaleDateString('pt-BR')}`
            : new Date(order.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
      <span className="rounded-full bg-liberado-light px-3 py-1 text-xs font-semibold text-liberado-dark">
        {ORDER_STATUS_LABELS[order.status]}
      </span>
    </Link>
  );
}
