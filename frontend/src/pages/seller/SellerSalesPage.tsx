import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Receipt, Store, TrendingUp } from 'lucide-react';
import { BarChart, StatCard } from '../../components/ui/StatCard';
import { SellerPlatformFeeNotice } from '../../components/sell/SellerPlatformFeeNotice';
import { formatPrice } from '../../lib/priceFormat';
import { ORDER_STATUS_LABELS } from '../../lib/ordersApi';
import { calculateSellerPayout } from '../../lib/platformFee';
import { getSellerSalesSummary, type SellerSalesSummary } from '../../lib/sellerSalesApi';
import { Button } from '../../components/ui/Button';

const PERIOD_OPTIONS = [7, 30, 90] as const;

export function SellerSalesPage() {
  const [periodDays, setPeriodDays] = useState<(typeof PERIOD_OPTIONS)[number]>(30);
  const [summary, setSummary] = useState<SellerSalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSellerSalesSummary(periodDays)
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null);
          setError('Não foi possível carregar o painel de vendas.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [periodDays]);

  return (
    <div className="t2f-page max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">Minhas vendas</h1>
          <p className="text-cinza">
            Acompanhe faturamento, pedidos em andamento e histórico de vendas concluídas.
          </p>
        </div>
        <Link to="/vender">
          <Button className="w-full sm:w-auto">Publicar anúncio</Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => setPeriodDays(days)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              periodDays === days
                ? 'bg-voo text-white'
                : 'border border-nuvem bg-white text-solo hover:bg-bruma'
            }`}
          >
            Últimos {days} dias
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-6 rounded-xl border border-nuvem bg-white p-4 text-pull">{error}</p>
      ) : null}

      {loading && !summary ? <p className="text-cinza">Carregando painel…</p> : null}

      {summary ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total vendido"
              value={formatPrice(summary.revenue.gmvCompleted)}
              hint={`${summary.orders.completed} vendas concluídas`}
            />
            <StatCard
              label="Recebimento líquido"
              value={formatPrice(summary.revenue.netPayoutCompleted)}
              hint={
                summary.commission?.firstSaleExempt
                  ? '1ª venda isenta de comissão'
                  : 'Após comissão (1ª venda isenta)'
              }
            />
            <StatCard
              label={`Vendido (${periodDays}d)`}
              value={formatPrice(summary.revenue.gmvCompletedInPeriod)}
              hint={`${summary.orders.completedInPeriod} vendas no período`}
            />
            <StatCard
              label="Ticket médio"
              value={formatPrice(summary.revenue.averageOrderValue)}
              hint="Média por venda concluída"
            />
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Pedidos em andamento"
              value={summary.orders.active}
              hint={
                summary.orders.pendingGmv > 0
                  ? `${formatPrice(summary.orders.pendingGmv)} aguardando conclusão`
                  : undefined
              }
            />
            <StatCard label="Anúncios ativos" value={summary.listings.active} />
            <StatCard
              label="Anúncios publicados"
              value={summary.listings.total}
              hint={`${summary.listings.total - summary.listings.active} encerrados`}
            />
            <StatCard
              label="Vendas canceladas"
              value={summary.orders.cancelled}
              hint="Pedidos cancelados no total"
            />
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-3">
            <Link
              to="/vendas/pedidos"
              className="flex items-center justify-between rounded-xl border border-nuvem bg-white p-4 transition-colors hover:border-voo/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bruma text-solo">
                  <Package className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold">Todos os pedidos</div>
                  <div className="text-sm text-cinza">Em andamento e histórico</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-cinza" />
            </Link>
            <Link
              to="/meus-anuncios"
              className="flex items-center justify-between rounded-xl border border-nuvem bg-white p-4 transition-colors hover:border-voo/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bruma text-solo">
                  <Store className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold">Meus anúncios</div>
                  <div className="text-sm text-cinza">{summary.listings.active} ativos agora</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-cinza" />
            </Link>
            <Link
              to="/perfil/recebimento"
              className="flex items-center justify-between rounded-xl border border-nuvem bg-white p-4 transition-colors hover:border-voo/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bruma text-solo">
                  <Receipt className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold">Recebimento</div>
                  <div className="text-sm text-cinza">Dados para repasse</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-cinza" />
            </Link>
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-2">
            <BarChart
              title={`Vendas por dia (${periodDays}d)`}
              items={summary.charts.salesByDay.slice(-14).map((row) => ({
                label: row.date.slice(5),
                value: row.gmv,
              }))}
              valueFormatter={(value) => formatPrice(value)}
            />
            <BarChart
              title="Quantidade por dia"
              items={summary.charts.salesByDay.slice(-14).map((row) => ({
                label: row.date.slice(5),
                value: row.count,
              }))}
            />
          </div>

          <SellerPlatformFeeNotice
            className="mb-6"
            firstSaleExempt={summary.commission?.firstSaleExempt === true}
          />

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <TrendingUp className="h-5 w-5 text-voo" />
                Vendas recentes
              </h2>
              <Link to="/vendas/pedidos?scope=history" className="text-sm font-semibold text-pull underline">
                Ver histórico completo
              </Link>
            </div>

            {summary.recentCompleted.length === 0 ? (
              <p className="rounded-xl border border-nuvem bg-white p-6 text-cinza">
                Nenhuma venda concluída ainda. Quando um pedido for finalizado, ele aparece aqui.
              </p>
            ) : (
              <div className="space-y-3">
                {summary.recentCompleted.map((order) => {
                  const { netPayout } = calculateSellerPayout(order.amount, {
                    commissionExempt: order.commissionExempt === true,
                  });
                  return (
                    <Link
                      key={order.id}
                      to={`/vendas/pedidos/${order.id}`}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-nuvem bg-white p-4 transition-colors hover:border-pull/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold">{order.listing.title}</div>
                        <div className="text-sm text-cinza">Comprador: {order.buyer.displayName}</div>
                        <div className="mt-1 font-mono text-sm text-pull">
                          {formatPrice(order.amount)}{' '}
                          <span className="text-xs text-cinza">· líquido {formatPrice(netPayout)}</span>
                        </div>
                        {order.completedAt ? (
                          <div className="text-xs text-cinza">
                            Concluído em {new Date(order.completedAt).toLocaleDateString('pt-BR')}
                          </div>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-liberado-light px-3 py-1 text-xs font-semibold text-liberado-dark">
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
