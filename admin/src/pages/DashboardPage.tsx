import { useEffect, useState } from 'react';
import { getDashboardSummary, type DashboardSummary } from '../lib/adminApi';
import { formatDate, formatPrice } from '../lib/api';
import { BarChart, StatCard } from '../components/StatCard';

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary(30)
      .then(setSummary)
      .catch(() => setError('Não foi possível carregar o dashboard.'));
  }, []);

  if (error) {
    return <p className="text-pull">{error}</p>;
  }

  if (!summary) {
    return <p className="text-cinza">Carregando dashboard…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-cinza">
          Atualizado em {formatDate(summary.generatedAt)} · últimos {summary.periodDays} dias
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuários cadastrados" value={summary.users.total} />
        <StatCard label="Usuários ativos" value={summary.users.active} />
        <StatCard label="Novos usuários (30d)" value={summary.users.newInPeriod} />
        <StatCard label="Novos hoje" value={summary.users.newToday} />
        <StatCard label="Anúncios ativos" value={summary.listings.active} />
        <StatCard label="Modo oferta" value={summary.listings.offersOnly} />
        <StatCard label="Pedidos totais" value={summary.orders.total} />
        <StatCard label="GMV total" value={formatPrice(summary.orders.gmvTotal)} />
        <StatCard label="GMV (30d)" value={formatPrice(summary.orders.gmvInPeriod)} />
        <StatCard label="Ticket médio" value={formatPrice(summary.orders.averageOrderValue)} />
        <StatCard label="Threads de chat" value={summary.chat.threadsTotal} />
        <StatCard label="Mensagens (30d)" value={summary.chat.messagesInPeriod} />
        <StatCard label="Ofertas (30d)" value={summary.chat.offersInPeriod} />
        <StatCard label="Violações" value={summary.violations.total} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart
          title="Cadastros por dia"
          items={summary.charts.signupsByDay.slice(-14).map((row) => ({
            label: row.date.slice(5),
            value: row.count,
          }))}
        />
        <BarChart
          title="Pedidos por dia"
          items={summary.charts.ordersByDay.slice(-14).map((row) => ({
            label: row.date.slice(5),
            value: row.count,
          }))}
        />
        <BarChart
          title="Anúncios por categoria"
          items={summary.charts.listingsByCategory.map((row) => ({
            label: row.category,
            value: row.count,
          }))}
        />
        <BarChart
          title="Pedidos por pagamento"
          items={summary.charts.ordersByPaymentType.map((row) => ({
            label: row.paymentType,
            value: row.count,
          }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-nuvem bg-white p-4">
          <h3 className="mb-3 font-display font-bold">Últimos cadastros</h3>
          <ul className="space-y-2 text-sm">
            {summary.recentActivity.recentUsers.map((user) => (
              <li key={user.id} className="flex justify-between gap-2">
                <span>{user.displayName}</span>
                <span className="text-cinza">{formatDate(user.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-nuvem bg-white p-4">
          <h3 className="mb-3 font-display font-bold">Últimos pedidos</h3>
          <ul className="space-y-2 text-sm">
            {summary.recentActivity.recentOrders.map((order) => (
              <li key={order.id} className="flex justify-between gap-2">
                <span className="truncate">{order.listingTitle}</span>
                <span className="font-mono">{formatPrice(order.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
