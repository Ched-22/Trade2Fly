import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type ToolResultCardProps = {
  title?: string;
  children: ReactNode;
  accent?: 'default' | 'conservador' | 'moderado' | 'agressivo';
};

const accentClasses = {
  default: 'border-voo/30 bg-voo-light/40',
  conservador: 'border-liberado/40 bg-liberado/10',
  moderado: 'border-voo/40 bg-voo-light/50',
  agressivo: 'border-pull/30 bg-pull/8',
};

export function ToolResultCard({ title, children, accent = 'default' }: ToolResultCardProps) {
  return (
    <div className={cn('mt-6 rounded-lg border p-5', accentClasses[accent])}>
      {title ? (
        <h3 className="mb-2 font-display text-lg font-bold text-solo">{title}</h3>
      ) : null}
      <div className="text-sm leading-relaxed text-solo">{children}</div>
    </div>
  );
}
