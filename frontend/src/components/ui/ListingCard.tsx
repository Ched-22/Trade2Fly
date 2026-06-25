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
        'group w-full overflow-hidden rounded-lg border border-nuvem bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-hover',
        className,
      )}
    >
      <Link to={`/anuncio/${listing.id}`} className="block">
        <div
          className="relative h-44 bg-cover bg-center"
          style={
            coverPhoto
              ? { backgroundImage: `url(${coverPhoto})` }
              : { background: listing.grad }
          }
        >
          {listing.escrow ? (
            <Badge variant="escrow" className="absolute top-3 left-3">
              <Shield className="mr-1 inline h-3 w-3" />
              Escrow
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
              className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-pull"
            >
              <Heart className={cn('h-4 w-4', favorited && 'fill-pull')} />
            </button>
          ) : null}
        </div>
        <div className="p-4">
          <div className="mb-1 font-mono text-lg font-bold text-pull">{listing.price}</div>
          <h3 className="mb-2 line-clamp-2 font-display text-base font-bold leading-snug text-solo">
            {listing.title}
          </h3>
          <p className="mb-3 font-mono text-xs tracking-wide text-cinza">{listing.specs}</p>
          <div className="flex items-center gap-1.5 text-sm text-cinza">
            <MapPin className="h-3.5 w-3.5" />
            {listing.location}
          </div>
        </div>
      </Link>
    </article>
  );
}
