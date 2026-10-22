import { useEffect, useState } from 'react';
import { OrderHistoryCard } from '../components/orders/OrderHistoryCard';
import { ScopeTabs } from '../components/ui/ScopeTabs';
import { getOrders, type OrderListItem, type OrderScope } from '../lib/ordersApi';

export function OrdersPage() {
  const [scope, setScope] = useState<OrderScope>('active');
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrders(scope)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  return (
    <div className="t2f-page max-w-3xl">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">Meus pedidos</h1>
      <p className="mb-6 text-cinza">Compras com pagamento protegido.</p>

      <ScopeTabs
        value={scope}
        onChange={setScope}
        options={[
          { value: 'active', label: 'Em andamento' },
          { value: 'history', label: 'Histórico' },
        ]}
      />

      {loading ? <p className="text-cinza">Carregando…</p> : null}

      {!loading && orders.length === 0 ? (
        <p className="rounded-xl border border-nuvem bg-white p-6 text-cinza">
          {scope === 'active'
            ? 'Você não tem pedidos em andamento.'
            : 'Nenhum pedido concluído ou cancelado no histórico.'}
        </p>
      ) : null}

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderHistoryCard key={order.id} order={order} to={`/pedidos/${order.id}`} />
        ))}
      </div>

      {scope === 'history' && orders.length > 0 ? (
        <p className="mt-6 text-center text-sm text-cinza">
          Pedidos concluídos ou cancelados aparecem aqui.
        </p>
      ) : null}
    </div>
  );
}
