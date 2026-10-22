import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDisputes,
  type AdminDisputeListItem,
  type DisputeListFilter,
  type DisputeStatus,
} from '../lib/adminApi';
import { formatDate, formatPrice } from '../lib/api';

const TABS: { value: DisputeListFilter; label: string }[] = [
  { value: 'awaiting_admin', label: 'Aguardando resposta nossa' },
  { value: 'awaiting_buyer', label: 'Aguardando comprador' },
  { value: 'open', label: 'Todas abertas' },
  { value: 'resolved', label: 'Resolvidas' },
];

const STATUS_LABELS: Record<DisputeStatus, string> = {
  awaiting_admin: 'Aguardando admin',
  awaiting_buyer: 'Aguardando comprador',
  resolved: 'Resolvida',
};

export function DisputesPage() {
  const [filter, setFilter] = useState<DisputeListFilter>('awaiting_admin');
  const [items, setItems] = useState<AdminDisputeListItem[]>([]);
  const [pendingAdmin, setPendingAdmin] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDisputes(filter, page, pageSize);
      setItems(data.items);
      setTotal(data.total);
      setPendingAdmin(data.pendingAdmin);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Disputas</h1>
        <p className="mt-1 text-sm text-cinza">
          Contestações abertas pelos compradores. Responda, acompanhe o histórico e decida o
          desfecho.
          {pendingAdmin > 0 ? (
            <strong className="ml-1 text-pull">
              {pendingAdmin} aguardando a sua resposta.
            </strong>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setFilter(tab.value);
              setPage(1);
            }}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold ${
              filter === tab.value
                ? 'border-voo bg-voo-light text-voo'
                : 'border-nuvem bg-white text-solo hover:bg-bruma'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-cinza">Carregando…</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-xl border border-nuvem bg-white p-6 text-sm text-cinza">
          Nenhuma disputa nesta lista.
        </p>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-nuvem bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-nuvem bg-bruma text-left">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Anúncio</th>
                <th className="px-4 py-3">Comprador</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Última mensagem</th>
                <th className="px-4 py-3">Última do comprador</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-nuvem/70">
                  <td className="px-4 py-3 font-mono">
                    <Link to={`/disputas/${item.orderId}`} className="font-semibold text-voo">
                      #{item.orderId}
                    </Link>
                    <div className="font-sans text-xs text-cinza">{STATUS_LABELS[item.status]}</div>
                  </td>
                  <td className="px-4 py-3">{item.listingTitle}</td>
                  <td className="px-4 py-3">{item.buyer.displayName}</td>
                  <td className="px-4 py-3">{item.seller.displayName}</td>
                  <td className="px-4 py-3 font-mono">{formatPrice(item.amount)}</td>
                  <td className="max-w-xs px-4 py-3">
                    {item.lastMessage ? (
                      <p className="line-clamp-2 text-cinza">
                        <span className="font-semibold">
                          {item.lastMessage.authorType === 'buyer' ? 'Comprador: ' : 'Admin: '}
                        </span>
                        {item.lastMessage.body}
                      </p>
                    ) : (
                      '—'
                    )}
                    <div className="text-xs text-cinza">{item.messageCount} mensagem(ns)</div>
                  </td>
                  <td className="px-4 py-3 text-cinza">{formatDate(item.lastBuyerMessageAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="cursor-pointer rounded-lg border border-nuvem bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-cinza">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="cursor-pointer rounded-lg border border-nuvem bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}
