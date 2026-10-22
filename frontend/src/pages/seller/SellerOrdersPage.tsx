import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSellerOrders } from '../../lib/sellerOrdersApi';
import { ORDER_STATUS_LABELS, type OrderDetail, type OrderScope } from '../../lib/ordersApi';
import { formatPrice } from '../../lib/priceFormat';
import { ScopeTabs } from '../../components/ui/ScopeTabs';
import { SellerPayoutBreakdown } from '../../components/sell/SellerPayoutBreakdown';
import { SellerPlatformFeeNotice } from '../../components/sell/SellerPlatformFeeNotice';
import { calculateSellerPayout } from '../../lib/platformFee';

function parseScope(value: string | null): OrderScope {
  if (value === 'history' || value === 'all') return value;
  return 'active';
}

export function SellerOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialScope = parseScope(searchParams.get('scope'));
  const [scope, setScope] = useState<OrderScope>(initialScope);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstSaleExempt, setFirstSaleExempt] = useState(false);

  useEffect(() => {
    setScope(parseScope(searchParams.get('scope')));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSellerOrders(scope)
      .then((data) => {
        if (!cancelled) {
          setOrders(data.items);
          setFirstSaleExempt(data.commission?.firstSaleExempt === true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const handleScopeChange = (next: OrderScope) => {
    setScope(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'active') params.delete('scope');
    else params.set('scope', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="t2f-page max-w-3xl">
      <Link to="/vendas" className="text-sm text-pull underline">
        ← Painel de vendas
      </Link>
      <h1 className="mt-4 mb-2 font-display text-3xl font-extrabold tracking-tight">Pedidos de venda</h1>
      <p className="mb-4 text-cinza">Gerencie despachos, provas e acompanhe o status de cada venda.</p>

      <ScopeTabs
        value={scope}
        onChange={handleScopeChange}
        options={[
          { value: 'active', label: 'Em andamento' },
          { value: 'history', label: 'Histórico' },
        ]}
      />

      <SellerPlatformFeeNotice className="mb-8" firstSaleExempt={firstSaleExempt} />

      {loading ? <p className="text-cinza">Carregando…</p> : null}
      {!loading && orders.length === 0 ? (
        <p className="rounded-xl border border-nuvem bg-white p-6 text-cinza">
          {scope === 'active'
            ? 'Nenhuma venda em andamento.'
            : 'Nenhuma venda concluída ou cancelada no histórico.'}
        </p>
      ) : null}

      <div className="space-y-4">
        {orders.map((order) => {
          const { netPayout } = calculateSellerPayout(order.amount, {
            commissionExempt: order.commissionExempt === true,
          });
          return (
            <Link
              key={order.id}
              to={`/vendas/pedidos/${order.id}`}
              className="block rounded-xl border border-nuvem bg-white p-4 transition-colors hover:border-pull/40"
            >
              <div className="font-bold">{order.listing.title}</div>
              <div className="text-sm text-cinza">Comprador: {order.buyer.displayName}</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-sm text-pull">{formatPrice(order.amount)}</span>
                  <span className="ml-2 text-xs text-cinza">líquido {formatPrice(netPayout)}</span>
                </div>
                <span className="rounded-full bg-bruma px-3 py-1 text-xs font-semibold">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              {order.completedAt ? (
                <div className="mt-1 text-xs text-cinza">
                  Concluído em {new Date(order.completedAt).toLocaleDateString('pt-BR')}
                </div>
              ) : null}
              <SellerPayoutBreakdown
                amount={order.amount}
                className="mt-3"
                compact
                commissionExempt={order.commissionExempt === true}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
