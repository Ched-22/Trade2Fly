import { Link } from 'react-router-dom';
import { formatDate, formatPrice } from '../lib/api';
import type { AdminOrderListItem } from '../lib/adminApi';
import { COMPLETION_SOURCE_LABELS, orderStatusLabel } from '../lib/orderLabels';

type OrdersTableProps = {
  orders: AdminOrderListItem[];
  showCompletion?: boolean;
};

export function OrdersTable({ orders, showCompletion = false }: OrdersTableProps) {
  if (orders.length === 0) {
    return <p className="text-sm text-cinza">Nenhum pedido encontrado.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-nuvem bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-nuvem bg-bruma text-left">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Anúncio</th>
            <th className="px-4 py-3">Comprador</th>
            <th className="px-4 py-3">Vendedor</th>
            <th className="px-4 py-3">Valor</th>
            <th className="px-4 py-3">Status</th>
            {showCompletion ? <th className="px-4 py-3">Conclusão</th> : null}
            <th className="px-4 py-3">Data</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-nuvem/70">
              <td className="px-4 py-3 font-mono">
                <Link to={`/pedidos/${order.id}`} className="font-semibold text-voo">
                  #{order.id}
                </Link>
              </td>
              <td className="px-4 py-3">{order.listingTitle}</td>
              <td className="px-4 py-3">
                <div>{order.buyerDisplayName}</div>
                <div className="text-xs text-cinza">{order.buyerEmail}</div>
              </td>
              <td className="px-4 py-3">
                <div>{order.sellerDisplayName}</div>
                <div className="text-xs text-cinza">{order.sellerEmail}</div>
              </td>
              <td className="px-4 py-3 font-mono">{formatPrice(order.amount)}</td>
              <td className="px-4 py-3">{orderStatusLabel(order.status)}</td>
              {showCompletion ? (
                <td className="px-4 py-3 text-xs text-cinza">
                  {order.completionSource
                    ? COMPLETION_SOURCE_LABELS[order.completionSource]
                    : '—'}
                </td>
              ) : null}
              <td className="px-4 py-3 text-cinza">
                {formatDate(showCompletion && order.completedAt ? order.completedAt : order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
