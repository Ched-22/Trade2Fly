import { useNavigate } from 'react-router-dom';
import type { HomeListingSectionConfig } from '../../data/homeListingSections';
import type { Listing } from '../../types/listing';
import { ListingCarousel } from '../ui/ListingCarousel';
import { ListingTile } from '../ui/ListingTile';

type HomeListingSectionProps = {
  config: HomeListingSectionConfig;
  listings: Array<Listing & { fav?: boolean }>;
  onToggleFavorite?: (id: number) => void;
};

export function HomeListingSection({
  config,
  listings,
  onToggleFavorite,
}: HomeListingSectionProps) {
  const navigate = useNavigate();

  if (listings.length === 0) {
    return null;
  }

  const handleSeeMore = () => navigate(config.seeMorePath);
  const desktopCta = config.seeMoreLabel ?? 'Ver todos os anúncios';

  return (
    <section className="py-6 sm:py-12">
      <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-3xl">
            {config.title}
          </h2>
          <p className="text-sm text-cinza sm:text-base">{config.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleSeeMore}
          className="hidden cursor-pointer self-start rounded-lg border border-solo bg-white px-3 py-1.5 text-xs font-semibold text-solo hover:bg-bruma sm:inline-flex sm:self-auto sm:px-4 sm:py-2 sm:text-sm"
        >
          {desktopCta}
        </button>
      </div>

      <ListingCarousel
        listings={listings}
        onToggleFavorite={onToggleFavorite}
        onSeeMore={handleSeeMore}
        seeMoreLabel="Ver mais"
      />

      <div className="hidden md:block">
        <div className="t2f-grid">
          {listings.map((listing) => (
            <ListingTile
              key={listing.id}
              listing={listing}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
