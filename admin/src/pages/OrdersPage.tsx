import { useCallback, useEffect, useState } from 'react';
import { exportOrdersCsv, getOrders, type AdminOrderListItem } from '../lib/adminApi';
import { OrdersTable } from '../components/OrdersTable';
import { ORDER_STATUS_LABELS } from '../lib/orderLabels';

export function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [completedOnly, setCompletedOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pageSize = 20;

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (status) params.set('status', status);
    if (completedOnly) params.set('completedOnly', 'true');
    if (q.trim()) params.set('q', q.trim());
    return params;
  }, [page, status, completedOnly, q]);

  const load = useCallback(async () => {
    const data = await getOrders(buildParams());
    setOrders(data.items);
    setTotal(data.total);
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold">Pedidos</h1>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={exporting}
          className="cursor-pointer rounded-lg border border-nuvem bg-white px-4 py-2 text-sm font-semibold text-solo disabled:opacity-60"
        >
          {exporting ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-nuvem px-3 text-sm"
        >
          <option value="">Todos os status</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-lg border border-nuvem px-3 text-sm">
          <input
            type="checkbox"
            checked={completedOnly}
            onChange={(event) => {
              setCompletedOnly(event.target.checked);
              setPage(1);
            }}
          />
          Apenas concluídos
        </label>
      </div>

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

      <OrdersTable orders={orders} showCompletion={completedOnly || status === 'completed'} />

      <div className="flex items-center justify-between text-sm text-cinza">
        <span>
          Página {page} de {totalPages} · {total} pedidos
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
