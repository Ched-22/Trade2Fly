import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthAlert } from '../components/auth/AuthAlert';
import { Button } from '../components/ui/Button';
import { ListingTile } from '../components/ui/ListingTile';
import { apiGet } from '../lib/api';
import { transformListingFromApi, type ListingApiRaw } from '../lib/listingTransform';
import { useAuth } from '../hooks/useAuth';
import type { Listing } from '../types/listing';

export function MyListingsPage() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet<ListingApiRaw[]>('/api/listings/me/listings')
      .then((data) => {
        if (!cancelled) {
          setMyListings(data.map(transformListingFromApi));
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
  }, []);

  return (
    <div className="t2f-page max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Meus anúncios
          </h1>
          <p className="text-cinza">
            {loading
              ? 'Carregando…'
              : `${myListings.length} ${myListings.length === 1 ? 'anúncio ativo' : 'anúncios ativos'}`}{' '}
            · {user?.displayName}
          </p>
        </div>
        <Link to="/vender" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Publicar anúncio</Button>
        </Link>
      </div>

      {error ? (
        <div className="mb-6">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      ) : null}

      {loading ? (
        <p className="text-cinza">Carregando anúncios…</p>
      ) : myListings.length === 0 ? (
        <div className="rounded-xl border border-nuvem bg-white p-8 text-center">
          <p className="mb-4 text-cinza">Você ainda não publicou nenhum anúncio.</p>
          <Link to="/vender">
            <Button>Publicar primeiro anúncio</Button>
          </Link>
        </div>
      ) : (
        <div className="t2f-grid">
          {myListings.map((listing) => (
            <ListingTile key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
