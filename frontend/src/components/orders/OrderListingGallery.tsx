import { useEffect, useId, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/cn';

type OrderListingGalleryProps = {
  title: string;
  imageUrl: string | null;
  imageUrls?: string[];
};

export function OrderListingGallery({ title, imageUrl, imageUrls }: OrderListingGalleryProps) {
  const titleId = useId();
  const urls =
    imageUrls && imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex == null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
        return;
      }
      if (urls.length < 2) return;
      if (event.key === 'ArrowLeft') {
        setActiveIndex((index) =>
          index == null ? index : (index - 1 + urls.length) % urls.length,
        );
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((index) => (index == null ? index : (index + 1) % urls.length));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, urls.length]);

  if (urls.length === 0) {
    return (
      <div
        className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-bruma text-5xl"
        aria-label={title}
      >
        🪂
      </div>
    );
  }

  const [cover, ...rest] = urls;
  const viewing = activeIndex != null ? urls[activeIndex] : null;
  const hasMultiple = urls.length > 1;

  const goPrev = () =>
    setActiveIndex((index) =>
      index == null ? 0 : (index - 1 + urls.length) % urls.length,
    );
  const goNext = () =>
    setActiveIndex((index) => (index == null ? 0 : (index + 1) % urls.length));

  return (
    <>
      <section aria-label="Fotos do anúncio" className="w-full">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="block w-full overflow-hidden rounded-xl bg-bruma text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voo"
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
                className="overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voo"
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

      {viewing && activeIndex != null ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-solo/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-nuvem bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 border-b border-nuvem px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p id={titleId} className="truncate font-display text-base font-bold text-solo">
                  {title}
                </p>
                {hasMultiple ? (
                  <p className="text-xs text-cinza">
                    Foto {activeIndex + 1} de {urls.length}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="shrink-0 rounded-lg p-2 text-cinza transition-colors hover:bg-bruma hover:text-solo"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="relative bg-bruma">
              {/* Fixed stage so modal size does not jump between photos */}
              <div className="relative mx-auto flex h-[min(58vh,28rem)] w-full items-center justify-center px-12 sm:px-14">
                <img
                  src={viewing}
                  alt={title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {hasMultiple ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-nuvem bg-white p-2 text-solo shadow-sm transition-colors hover:bg-bruma sm:left-3"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-nuvem bg-white p-2 text-solo shadow-sm transition-colors hover:bg-bruma sm:right-3"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>

            {hasMultiple ? (
              <footer className="border-t border-nuvem px-4 py-3 sm:px-5">
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {urls.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                        index === activeIndex
                          ? 'border-voo'
                          : 'border-transparent opacity-70 hover:opacity-100',
                      )}
                      aria-label={`Ir para foto ${index + 1}`}
                      aria-current={index === activeIndex ? 'true' : undefined}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </footer>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
