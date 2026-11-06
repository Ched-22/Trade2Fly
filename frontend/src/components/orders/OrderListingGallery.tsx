import { useState } from 'react';
import { Package } from 'lucide-react';
import { PhotoLightbox } from '../ui/PhotoLightbox';

type OrderListingGalleryProps = {
  title: string;
  imageUrl: string | null;
  imageUrls?: string[];
};

export function OrderListingGallery({ title, imageUrl, imageUrls }: OrderListingGalleryProps) {
  const urls =
    imageUrls && imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (urls.length === 0) {
    return (
      <div
        className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-bruma text-5xl"
        aria-label={title}
      >
        <Package className="h-10 w-10 text-cinza" strokeWidth={1.25} />
      </div>
    );
  }

  const [cover, ...rest] = urls;

  return (
    <>
      <section aria-label="Fotos do anúncio" className="w-full">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-bruma text-left"
          aria-label={`Ver foto de ${title}`}
        >
          <img
            src={cover}
            alt={title}
            className="aspect-[16/10] w-full object-cover transition-opacity hover:opacity-95"
          />
        </button>
        {rest.length > 0 ? (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {rest.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setActiveIndex(index + 1)}
                className="cursor-zoom-in overflow-hidden rounded-lg"
                aria-label={`Ver foto ${index + 2} de ${title}`}
              >
                <img
                  src={url}
                  alt=""
                  className="aspect-square w-full object-cover transition-opacity hover:opacity-95"
                />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <PhotoLightbox
        urls={urls}
        index={activeIndex}
        title={title}
        onIndexChange={setActiveIndex}
      />
    </>
  );
}
