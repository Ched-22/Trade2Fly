import { useEffect, useState } from 'react';
import { getListings, updateListingActive } from '../lib/adminApi';
import { formatPrice } from '../lib/api';

type ListingRow = {
  id: number;
  title: string;
  priceNum: number;
  category: string;
  saleMode: string;
  active: boolean;
  sellerEmail: string;
  createdAt: string;
};

export function ListingsPage() {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getListings(new URLSearchParams());
      setListings(data.items as ListingRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleActive = async (listing: ListingRow) => {
    await updateListingActive(listing.id, !listing.active);
    void load();
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Anúncios</h1>
      <div className="overflow-x-auto rounded-xl border border-nuvem bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-nuvem bg-bruma text-left">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Modo</th>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Status</th>
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
              listings.map((listing) => (
                <tr key={listing.id} className="border-b border-nuvem/70">
                  <td className="px-4 py-3 font-semibold">{listing.title}</td>
                  <td className="px-4 py-3 font-mono">{formatPrice(listing.priceNum)}</td>
                  <td className="px-4 py-3">{listing.category}</td>
                  <td className="px-4 py-3">{listing.saleMode}</td>
                  <td className="px-4 py-3">{listing.sellerEmail}</td>
                  <td className="px-4 py-3">{listing.active ? 'Ativo' : 'Inativo'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void toggleActive(listing)}
                      className="cursor-pointer text-sm font-semibold text-voo"
                    >
                      {listing.active ? 'Desativar' : 'Reativar'}
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
