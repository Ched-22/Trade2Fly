import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getViolations, updateUserActive } from '../lib/adminApi';
import { formatDate, formatPrice } from '../lib/api';

type ViolationRow = {
  id: number;
  userId: string;
  userEmail: string;
  listingId: number;
  listingTitle: string;
  attemptedAmount: number;
  agreedPrice: number;
  createdAt: string;
};

export function ViolationsPage() {
  const [violations, setViolations] = useState<ViolationRow[]>([]);

  const load = async () => {
    const data = await getViolations(new URLSearchParams());
    setViolations(data.items as ViolationRow[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const suspendUser = async (userId: string) => {
    await updateUserActive(userId, false);
    void load();
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Violações de checkout</h1>
      <div className="overflow-x-auto rounded-xl border border-nuvem bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-nuvem bg-bruma text-left">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Anúncio</th>
              <th className="px-4 py-3">Tentou</th>
              <th className="px-4 py-3">Acordado</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((violation) => (
              <tr key={violation.id} className="border-b border-nuvem/70">
                <td className="px-4 py-3">
                  <Link to={`/usuarios/${violation.userId}`} className="font-semibold text-voo">
                    {violation.userEmail}
                  </Link>
                </td>
                <td className="px-4 py-3">{violation.listingTitle}</td>
                <td className="px-4 py-3 font-mono text-pull">
                  {formatPrice(violation.attemptedAmount)}
                </td>
                <td className="px-4 py-3 font-mono">{formatPrice(violation.agreedPrice)}</td>
                <td className="px-4 py-3 text-cinza">{formatDate(violation.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void suspendUser(violation.userId)}
                    className="cursor-pointer text-sm font-semibold text-pull"
                  >
                    Suspender
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
