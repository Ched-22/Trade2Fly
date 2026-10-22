import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUser, updateUserActive, type AdminUserDetail } from '../lib/adminApi';
import { formatDate, formatPrice } from '../lib/api';
import { OrdersTable } from '../components/OrdersTable';

type ProfileTab = 'buyer' | 'seller';

export function UserDetailPage() {
  const { userId } = useParams();
  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [tab, setTab] = useState<ProfileTab>('buyer');

  useEffect(() => {
    if (!userId) return;
    getUser(userId).then(setData).catch(() => setData(null));
  }, [userId]);

  if (!data) {
    return <p className="text-cinza">Carregando usuário…</p>;
  }

  const toggleActive = async () => {
    if (!userId) return;
    await updateUserActive(userId, !data.user.active);
    const refreshed = await getUser(userId);
    setData(refreshed);
  };

  return (
    <div className="space-y-6">
      <Link to="/usuarios" className="text-sm font-semibold text-voo">
        ← Voltar
      </Link>

      <div className="rounded-xl border border-nuvem bg-white p-5">
        <h1 className="font-display text-2xl font-extrabold">{data.user.displayName}</h1>
        <p className="text-cinza">{data.user.email}</p>
        <p className="mt-1 text-sm text-cinza">
          Cadastro: {formatDate(data.user.createdAt)} · Papel: {data.user.role}
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => void toggleActive()}
            className="cursor-pointer rounded-lg bg-pull px-4 py-2 text-sm font-semibold text-white"
          >
            {data.user.active ? 'Suspender conta' : 'Reativar conta'}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['buyer', 'seller'] as ProfileTab[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === value ? 'bg-voo text-white' : 'border border-nuvem bg-white text-solo'
            }`}
          >
            {value === 'buyer' ? 'Comprador' : 'Vendedor'}
          </button>
        ))}
      </div>

      {tab === 'buyer' ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-nuvem bg-white p-4">
              <div className="text-xs uppercase text-cinza">Pedidos</div>
              <div className="font-mono text-xl font-bold">
                {data.buyerProfile.stats.ordersTotal}
              </div>
            </div>
            <div className="rounded-xl border border-nuvem bg-white p-4">
              <div className="text-xs uppercase text-cinza">Concluídos</div>
              <div className="font-mono text-xl font-bold">
                {data.buyerProfile.stats.ordersCompleted}
              </div>
            </div>
            <div className="rounded-xl border border-nuvem bg-white p-4">
              <div className="text-xs uppercase text-cinza">Total gasto</div>
              <div className="font-mono text-xl font-bold">
                {formatPrice(data.buyerProfile.stats.totalSpent)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Compras recentes</h2>
            <Link
              to={`/usuarios/${userId}/pedidos?role=buyer`}
              className="text-sm font-semibold text-voo"
            >
              Ver todos
            </Link>
          </div>
          <OrdersTable orders={data.buyerProfile.recentOrders} />
          <Link
            to={`/usuarios/${userId}/pedidos?role=buyer&status=completed`}
            className="text-sm font-semibold text-voo"
          >
            Ver compras concluídas →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-nuvem bg-white p-4">
              <div className="text-xs uppercase text-cinza">Anúncios</div>
              <div className="font-mono text-xl font-bold">
                {data.sellerProfile.stats.listingsTotal}
              </div>
            </div>
            <div className="rounded-xl border border-nuvem bg-white p-4">
              <div className="text-xs uppercase text-cinza">Ativos</div>
              <div className="font-mono text-xl font-bold">
                {data.sellerProfile.stats.listingsActive}
              </div>
            </div>
            <div className="rounded-xl border border-nuvem bg-white p-4">
              <div className="text-xs uppercase text-cinza">Vendas</div>
              <div className="font-mono text-xl font-bold">
                {data.sellerProfile.stats.salesTotal}
              </div>
            </div>
            <div className="rounded-xl border border-nuvem bg-white p-4">
              <div className="text-xs uppercase text-cinza">Concluídas</div>
              <div className="font-mono text-xl font-bold">
                {data.sellerProfile.stats.salesCompleted}
              </div>
            </div>
            <div className="rounded-xl border border-nuvem bg-white p-4">
              <div className="text-xs uppercase text-cinza">GMV concluído</div>
              <div className="font-mono text-xl font-bold">
                {formatPrice(data.sellerProfile.stats.gmvCompleted)}
              </div>
            </div>
          </div>

          <section>
            <h2 className="mb-3 font-bold">Anúncios recentes</h2>
            <ul className="space-y-2 rounded-xl border border-nuvem bg-white p-4 text-sm">
              {data.sellerProfile.recentListings.map((listing) => (
                <li key={listing.id} className="flex justify-between gap-3">
                  <span>{listing.title}</span>
                  <span className="font-mono">{formatPrice(listing.priceNum)}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex items-center justify-between">
            <h2 className="font-bold">Vendas recentes</h2>
            <Link
              to={`/usuarios/${userId}/pedidos?role=seller`}
              className="text-sm font-semibold text-voo"
            >
              Ver todas
            </Link>
          </div>
          <OrdersTable orders={data.sellerProfile.recentSales} />
          <Link
            to={`/usuarios/${userId}/pedidos?role=seller&status=completed`}
            className="text-sm font-semibold text-voo"
          >
            Ver vendas concluídas →
          </Link>
        </div>
      )}

      {data.recentViolations.length > 0 ? (
        <section className="rounded-xl border border-nuvem bg-white p-4">
          <h2 className="mb-3 font-bold">Violações recentes</h2>
          <p className="text-sm text-cinza">{data.recentViolations.length} registro(s)</p>
        </section>
      ) : null}
    </div>
  );
}
