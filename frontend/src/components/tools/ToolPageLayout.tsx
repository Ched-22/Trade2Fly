import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ToolDisclaimer } from './ToolDisclaimer';

type ToolPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
};

export function ToolPageLayout({
  title,
  description,
  children,
  ctaHref = '/busca',
  ctaLabel = 'Ver anúncios',
}: ToolPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-cinza">
        <Link to="/" className="hover:text-voo">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link to="/ferramentas" className="hover:text-voo">
          Ferramentas
        </Link>
        <span aria-hidden>/</span>
        <span className="text-solo">{title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-solo sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-cinza">{description}</p>
      </header>

      <div className="rounded-xl border border-nuvem bg-white p-5 shadow-sm sm:p-8">
        {children}
      </div>

      <ToolDisclaimer />

      <div className="mt-8 flex justify-center">
        <Link to={ctaHref}>
          <Button variant="secondary">{ctaLabel}</Button>
        </Link>
      </div>
    </div>
  );
}
