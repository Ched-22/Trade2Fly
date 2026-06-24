import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ListingTile } from '../components/ui/ListingTile';
import { listings } from '../data/mockListings';
import { useAuth } from '../hooks/useAuth';

const sellerDisplayName = 'Ana Martins';

export function MyListingsPage() {
  const { user } = useAuth();

  const myListings = listings
    .filter((listing) => listing.seller === sellerDisplayName)
    .map((listing) => ({ ...listing, fav: false }));

  return (
    <div className="t2f-page max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Meus anúncios</h1>
          <p className="text-cinza">
            {myListings.length} {myListings.length === 1 ? 'anúncio ativo' : 'anúncios ativos'} · {user?.displayName}
          </p>
        </div>
        <Link to="/vender" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Publicar anúncio</Button>
        </Link>
      </div>

      <div className="t2f-grid">
        {myListings.map((listing) => (
          <ListingTile key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
