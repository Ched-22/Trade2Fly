import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthAlert } from '../components/auth/AuthAlert';
import { Button } from '../components/ui/Button';
import { ScopeTabs } from '../components/ui/ScopeTabs';
import { MyListingCard } from '../components/sell/MyListingCard';
import { SellerPlatformFeeNotice } from '../components/sell/SellerPlatformFeeNotice';
import { getMyListings, type MyListingsFilter } from '../lib/myListingsApi';
import { getSellerCommissionInfo } from '../lib/sellerSalesApi';
import { useAuth } from '../hooks/useAuth';
import type { Listing } from '../types/listing';

export function MyListingsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<MyListingsFilter>('true');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstSaleExempt, setFirstSaleExempt] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSellerCommissionInfo()
      .then((info) => {
        if (!cancelled) setFirstSaleExempt(info.firstSaleExempt);
      })
      .catch(() => {
        if (!cancelled) setFirstSaleExempt(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyListings(filter)
      .then((data) => {
        if (!cancelled) {
          setMyListings(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMyListings([]);
          setError('Não foi possível carregar seus anúncios.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const countLabel =
    filter === 'true'
      ? myListings.length === 1
        ? 'anúncio ativo ou em venda'
        : 'anúncios ativos ou em venda'
      : myListings.length === 1
        ? 'anúncio no histórico'
        : 'anúncios no histórico';

  return (
    <div className="t2f-page max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Meus anúncios
          </h1>
          <p className="text-cinza">
            {loading ? 'Carregando…' : `${myListings.length} ${countLabel}`} · {user?.displayName}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link to="/vender" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Publicar anúncio</Button>
          </Link>
          <Link to="/vendas" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Painel de vendas
            </Button>
          </Link>
        </div>
      </div>

      <ScopeTabs
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'true', label: 'Ativos / em venda' },
          { value: 'false', label: 'Histórico' },
        ]}
      />

      <SellerPlatformFeeNotice className="mb-6" firstSaleExempt={firstSaleExempt} />

      {error ? (
        <div className="mb-6">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      ) : null}

      {loading ? (
        <p className="text-cinza">Carregando anúncios…</p>
      ) : myListings.length === 0 ? (
        <div className="rounded-xl border border-nuvem bg-white p-8 text-center">
          <p className="mb-4 text-cinza">
            {filter === 'true'
              ? 'Você ainda não publicou nenhum anúncio.'
              : 'Nenhum anúncio encerrado no histórico.'}
          </p>
          {filter === 'true' ? (
            <Link to="/vender">
              <Button>Publicar primeiro anúncio</Button>
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((listing) => (
            <MyListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
