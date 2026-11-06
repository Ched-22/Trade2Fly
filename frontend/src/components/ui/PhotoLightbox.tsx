import { useEffect, useId } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/cn';

type PhotoLightboxProps = {
  urls: string[];
  /** Índice da foto aberta; null mantém o modal fechado. */
  index: number | null;
  title: string;
  onIndexChange: (index: number | null) => void;
};

/** Modal de fotos em tela cheia: setas, teclado (←, →, Esc) e miniaturas. */
export function PhotoLightbox({ urls, index, title, onIndexChange }: PhotoLightboxProps) {
  const titleId = useId();
  const open = index != null && urls[index] != null;
  const count = urls.length;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onIndexChange(null);
        return;
      }
      if (count < 2 || index == null) return;
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + count) % count);
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % count);
    };

    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, index, count, onIndexChange]);

  if (!open || index == null) return null;

  const hasMultiple = count > 1;
  const goPrev = () => onIndexChange((index - 1 + count) % count);
  const goNext = () => onIndexChange((index + 1) % count);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-solo/[0.97]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => onIndexChange(null)}
    >
      <header
        className="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-w-0">
          <p id={titleId} className="truncate font-display text-[1.25rem] leading-none font-bold">
            {title}
          </p>
          {hasMultiple ? (
            <p className="t2f-eyebrow mt-1.5 text-[0.62rem] text-white/60">
              Foto {index + 1} de {count}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onIndexChange(null)}
          className="shrink-0 cursor-pointer rounded-md border border-white/30 p-2 text-white transition-colors hover:bg-white hover:text-solo"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
        <img
          src={urls[index]}
          alt={title}
          className="max-h-full max-w-full object-contain"
          onClick={(event) => event.stopPropagation()}
        />
        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-pointer rounded-md border border-white/30 bg-solo/70 p-2.5 text-white transition-colors hover:bg-white hover:text-solo sm:left-5"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer rounded-md border border-white/30 bg-solo/70 p-2.5 text-white transition-colors hover:bg-white hover:text-solo sm:right-5"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <footer className="px-4 py-3 sm:px-6" onClick={(event) => event.stopPropagation()}>
          <div className="mx-auto flex max-w-3xl justify-center gap-2 overflow-x-auto pb-0.5">
            {urls.map((url, i) => (
              <button
                key={`${i}-${url.slice(0, 24)}`}
                type="button"
                onClick={() => onIndexChange(i)}
                className={cn(
                  'h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all',
                  i === index ? 'border-pull' : 'border-transparent opacity-60 hover:opacity-100',
                )}
                aria-label={`Ir para foto ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
