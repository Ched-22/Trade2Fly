import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'escrow' | 'success' | 'category' | 'error';

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  escrow: 'bg-liberado-light text-liberado-dark border border-liberado/30',
  success: 'bg-liberado-light text-liberado-dark',
  category: 'bg-voo-light text-voo-dark uppercase tracking-wide text-[0.7rem]',
  error: 'bg-red-50 text-error',
};

export function Badge({ variant = 'category', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
