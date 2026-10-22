import { useCallback, useEffect, useState } from 'react';
import {
  exportOrdersCsv,
  getCompletedSummary,
  getOrders,
  type AdminOrderListItem,
  type CompletedSummary,
} from '../lib/adminApi';
import { formatPrice } from '../lib/api';
import { OrdersTable } from '../components/OrdersTable';
import { StatCard } from '../components/StatCard';

export function CompletedSalesPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [summary, setSummary] = useState<CompletedSummary | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [exporting, setExporting] = useState(false);
  const pageSize = 20;

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({
      completedOnly: 'true',
      page: String(page),
      pageSize: String(pageSize),
    });
    if (q.trim()) params.set('q', q.trim());
    return params;
  }, [page, q]);

  const load = useCallback(async () => {
    const params = buildParams();
    const [ordersData, summaryData] = await Promise.all([
      getOrders(params),
      getCompletedSummary(30),
    ]);
    setOrders(ordersData.items);
    setTotal(ordersData.total);
    setSummary(summaryData);
  }, [buildParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = buildParams();
      params.delete('page');
      params.delete('pageSize');
      await exportOrdersCsv(params);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Vendas concluídas</h1>
          <p className="text-sm text-cinza">Pedidos finalizados nos últimos 30 dias.</p>
        </div>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={exporting}
          className="cursor-pointer rounded-lg bg-voo px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {exporting ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Concluídas (30d)" value={String(summary.completedCount)} />
          <StatCard label="GMV concluído" value={formatPrice(summary.gmvCompleted)} />
          <StatCard label="Ticket médio" value={formatPrice(summary.averageOrderValue)} />
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por anúncio, comprador ou vendedor"
          className="h-10 flex-1 rounded-lg border border-nuvem px-3 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            setQ(searchInput);
            setPage(1);
          }}
          className="cursor-pointer rounded-lg bg-voo px-4 text-sm font-semibold text-white"
        >
          Buscar
        </button>
      </div>

      <OrdersTable orders={orders} showCompletion />

      <div className="flex items-center justify-between text-sm text-cinza">
        <span>
          Página {page} de {totalPages} · {total} vendas
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="cursor-pointer rounded-lg border border-nuvem px-3 py-1 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="cursor-pointer rounded-lg border border-nuvem px-3 py-1 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
