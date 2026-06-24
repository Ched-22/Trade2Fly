import { ListingCard } from './ListingCard';
import type { Listing } from '../../types/listing';

type ListingTileProps = {
  listing: Listing & { fav?: boolean };
  onToggleFavorite?: (id: number) => void;
  className?: string;
};

export function ListingTile({ listing, onToggleFavorite, className }: ListingTileProps) {
  return (
    <ListingCard
      listing={listing}
      favorited={listing.fav}
      onToggleFavorite={onToggleFavorite}
      className={className}
    />
  );
}
