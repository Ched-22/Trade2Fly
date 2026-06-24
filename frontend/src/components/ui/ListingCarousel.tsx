import { ArrowRight } from 'lucide-react';
import type { Listing } from '../../types/listing';
import { ListingTile } from './ListingTile';

/** Fixed width for every carousel slide (flex `min-width: auto` must not expand the first card). */
const carouselCardWidth = 'w-[240px] min-w-[240px] max-w-[240px]';

type ListingCarouselProps = {
  listings: Array<Listing & { fav?: boolean }>;
  onToggleFavorite?: (id: number) => void;
  onSeeMore: () => void;
  seeMoreLabel?: string;
};

export function ListingCarousel({
  listings,
  onToggleFavorite,
  onSeeMore,
  seeMoreLabel = 'Ver mais',
}: ListingCarouselProps) {
  return (
    <div className="overflow-x-auto overscroll-x-contain pb-1 t2f-scroll snap-x snap-mandatory md:hidden">
      <div className="flex w-max flex-nowrap items-stretch gap-3 pe-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className={`${carouselCardWidth} shrink-0 grow-0 snap-start`}
          >
            <ListingTile
              listing={listing}
              onToggleFavorite={onToggleFavorite}
              className="h-full"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={onSeeMore}
          className="flex w-[88px] min-w-[88px] shrink-0 grow-0 snap-start cursor-pointer flex-col items-center justify-center gap-2 self-center border-none bg-transparent"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-solo bg-white transition-colors hover:bg-bruma">
            <ArrowRight className="h-5 w-5 text-solo" />
          </span>
          <span className="font-display text-xs font-bold text-solo">{seeMoreLabel}</span>
        </button>
      </div>
    </div>
  );
}
