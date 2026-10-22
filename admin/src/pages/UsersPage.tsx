import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, updateUserActive, type AdminUser } from '../lib/adminApi';
import { formatDate } from '../lib/api';

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (search = query) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      const data = await getUsers(params);
      setUsers(data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleActive = async (user: AdminUser) => {
    await updateUserActive(user.id, !user.active);
    void load();
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Usuários</h1>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por e-mail ou nome"
          className="h-10 flex-1 rounded-lg border border-nuvem px-3 text-sm"
        />
        <button
          type="button"
          onClick={() => void load()}
          className="cursor-pointer rounded-lg bg-voo px-4 text-sm font-semibold text-white"
        >
          Buscar
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-nuvem bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-nuvem bg-bruma text-left">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Anúncios</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-cinza">
                  Carregando…
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-nuvem/70">
                  <td className="px-4 py-3">
                    <Link to={`/usuarios/${user.id}`} className="font-semibold text-voo">
                      {user.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        user.active ? 'bg-liberado-light text-liberado' : 'bg-red-50 text-pull'
                      }`}
                    >
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{user.listingsCount ?? 0}</td>
                  <td className="px-4 py-3 font-mono">{user.ordersCount ?? 0}</td>
                  <td className="px-4 py-3 text-cinza">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void toggleActive(user)}
                      className="cursor-pointer text-sm font-semibold text-voo"
                    >
                      {user.active ? 'Suspender' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
