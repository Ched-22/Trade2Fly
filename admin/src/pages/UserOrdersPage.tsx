import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getUserOrders, type AdminOrderListItem } from '../lib/adminApi';
import { OrdersTable } from '../components/OrdersTable';

export function UserOrdersPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as 'buyer' | 'seller') ?? 'buyer';
  const status = searchParams.get('status') ?? '';
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!userId) return;
    const params = new URLSearchParams({ role, page: String(page), pageSize: String(pageSize) });
    if (status) params.set('status', status);
    getUserOrders(userId, params).then((data) => {
      setOrders(data.items);
      setTotal(data.total);
    });
  }, [userId, role, status, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const title = role === 'buyer' ? 'Pedidos como comprador' : 'Vendas como vendedor';

  return (
    <div className="space-y-4">
      <Link to={`/usuarios/${userId}`} className="text-sm font-semibold text-voo">
        ← Voltar ao usuário
      </Link>
      <h1 className="font-display text-2xl font-extrabold">{title}</h1>
      <OrdersTable orders={orders} showCompletion={status === 'completed'} />
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
