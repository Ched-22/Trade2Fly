import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ListingTile } from '../components/ui/ListingTile';
import { useMarketplace } from '../hooks/useMarketplace';
import { Button } from '../components/ui/Button';

export function FavoritesPage() {
  const { favorites, toggleFavorite, favCount, allListings, listingsLoading } = useMarketplace();

  const favListings = useMemo(
    () =>
      allListings
        .filter((listing) => favorites[listing.id])
        .map((listing) => ({ ...listing, fav: true })),
    [allListings, favorites],
  );

  return (
    <div className="t2f-page">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">Favoritos</h1>
      <p className="mb-8 text-cinza">
        {listingsLoading ? 'Carregando…' : `${favCount} ${favCount === 1 ? 'item salvo' : 'itens salvos'}`}
      </p>

      {listingsLoading ? (
        <p className="text-cinza">Carregando anúncios…</p>
      ) : favListings.length > 0 ? (
        <div className="t2f-grid">
          {favListings.map((listing) => (
            <ListingTile key={listing.id} listing={listing} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-nuvem bg-white p-12 text-center">
          <p className="mb-4 text-cinza">Você ainda não salvou nenhum anúncio.</p>
          <Link to="/busca">
            <Button variant="secondary">Explorar anúncios</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
