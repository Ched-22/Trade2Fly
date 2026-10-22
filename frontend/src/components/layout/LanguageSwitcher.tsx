import { Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

type LanguageCode = 'pt' | 'en' | 'es';

const LANGUAGES: { code: LanguageCode; label: string; short: string }[] = [
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
];

const STORAGE_KEY = 't2f_language';

function getStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'pt' || stored === 'en' || stored === 'es') return stored;
  } catch {
    // ignore
  }
  return 'pt';
}

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<LanguageCode>(getStoredLanguage);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
    close();
  };

  const current = LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Selecionar idioma"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent px-2 text-solo hover:bg-bruma sm:h-10"
      >
        <Globe className="h-5 w-5" strokeWidth={1.75} />
        <span className="text-xs font-semibold">{current.short}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-[80] mt-2 w-36 overflow-hidden rounded-lg border border-nuvem bg-white py-1 text-solo shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              role="menuitem"
              onClick={() => selectLanguage(item.code)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between border-none px-3 py-2 text-left text-sm font-medium',
                item.code === language ? 'bg-bruma text-solo' : 'text-solo hover:bg-bruma',
              )}
            >
              {item.label}
              {item.code === language ? <span className="text-voo">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
