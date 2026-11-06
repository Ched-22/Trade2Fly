import { useNavigate } from 'react-router-dom';
import type { HomeListingSectionConfig } from '../../data/homeListingSections';
import type { Listing } from '../../types/listing';
import { SectionTitle } from '../ui/SectionTitle';
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
    <section className="py-8 sm:py-14">
      <SectionTitle
        title={config.title}
        subtitle={config.subtitle}
        action={
          <button
            type="button"
            onClick={handleSeeMore}
            className="t2f-eyebrow hidden shrink-0 cursor-pointer border-b border-solo pb-0.5 text-solo transition-colors hover:border-pull hover:text-pull sm:inline-block"
          >
            {desktopCta} →
          </button>
        }
      />

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
