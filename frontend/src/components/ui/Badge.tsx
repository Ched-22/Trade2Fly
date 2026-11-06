import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'escrow' | 'success' | 'category' | 'error';

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  escrow: 'bg-solo text-white',
  success: 'bg-liberado-light text-liberado-dark',
  category: 'bg-voo-light text-voo-dark',
  error: 'bg-error/10 text-error',
};

export function Badge({ variant = 'category', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        't2f-eyebrow inline-flex items-center rounded-sm px-2 py-1 text-[0.62rem] leading-none',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
