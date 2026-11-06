import { Heart, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Listing } from '../../types/listing';
import { getListingCoverPhoto } from '../../lib/listingPhotoStorage';
import { Badge } from './Badge';
import { cn } from '../../lib/cn';

type ListingCardProps = {
  listing: Listing;
  favorited?: boolean;
  onToggleFavorite?: (id: number) => void;
  className?: string;
};

export function ListingCard({
  listing,
  favorited = false,
  onToggleFavorite,
  className,
}: ListingCardProps) {
  const coverPhoto =
    listing.imageUrls?.[0] ?? listing.coverPhotoUrl ?? getListingCoverPhoto(listing.id);

  return (
    <article
      className={cn(
        'group w-full overflow-hidden rounded-lg border border-nuvem bg-white transition-colors duration-200 hover:border-solo',
        className,
      )}
    >
      <Link to={`/anuncio/${listing.id}`} className="block">
        <div
          className="relative aspect-[4/3] bg-cover bg-center"
          style={
            coverPhoto
              ? { backgroundImage: `url(${coverPhoto})` }
              : { background: listing.grad }
          }
        >
          {listing.escrow ? (
            <Badge variant="escrow" className="absolute top-0 left-0">
              <Shield className="mr-1.5 h-3 w-3 text-pull" />
              Custódia
            </Badge>
          ) : null}
          {onToggleFavorite ? (
            <button
              type="button"
              aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={(event) => {
                event.preventDefault();
                onToggleFavorite(listing.id);
              }}
              className="absolute top-2.5 right-2.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm bg-white text-solo hover:text-pull"
            >
              <Heart className={cn('h-4 w-4', favorited && 'fill-pull')} />
            </button>
          ) : null}
        </div>
        <div className="border-t border-nuvem p-4">
          <div className="mb-1.5 font-mono text-[1.05rem] font-bold tracking-tight text-solo">{listing.price}</div>
          <h3 className="mb-2 line-clamp-2 font-display text-[1.18rem] font-bold leading-[1.1] text-solo">
            {listing.title}
          </h3>
          <p className="t2f-eyebrow mb-3 text-[0.62rem] text-cinza">{listing.specs}</p>
          <div className="flex items-center gap-1.5 text-sm text-cinza">
            <MapPin className="h-3.5 w-3.5" />
            {listing.location}
          </div>
        </div>
      </Link>
    </article>
  );
}
