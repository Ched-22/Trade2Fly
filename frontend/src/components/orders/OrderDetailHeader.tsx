import {
  ORDER_STATUS_LABELS,
  paymentTypeLabel,
  type OrderDetail,
} from '../../lib/ordersApi';
import { formatPrice } from '../../lib/priceFormat';

type OrderDetailHeaderProps = {
  order: OrderDetail;
  /** Visão do vendedor mostra o comprador; padrão (comprador) mostra o vendedor. */
  viewer?: 'buyer' | 'seller';
};

export function OrderDetailHeader({ order, viewer = 'buyer' }: OrderDetailHeaderProps) {
  const counterpartLabel = viewer === 'seller' ? 'Comprador' : 'Vendedor';
  const counterpartName =
    viewer === 'seller' ? order.buyer.displayName : order.seller.displayName;
  return (
    <header>
      <h1 className="font-display text-3xl font-extrabold text-solo">{order.listing.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-liberado-light px-3 py-1 text-xs font-semibold text-liberado-dark">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
        <span className="font-mono text-lg font-bold text-pull">{formatPrice(order.amount)}</span>
        <span className="text-sm text-cinza">· {paymentTypeLabel(order.paymentType)}</span>
      </div>
      <p className="mt-2 text-sm text-cinza">
        {counterpartLabel}: <span className="font-medium text-solo">{counterpartName}</span>
        {order.listing.location ? (
          <>
            {' '}
            · {order.listing.location}
          </>
        ) : null}
      </p>
    </header>
  );
}
