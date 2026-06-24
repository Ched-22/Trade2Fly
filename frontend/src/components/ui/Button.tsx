import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-pull text-white shadow-[0_2px_8px_rgba(255,81,46,0.32)] hover:bg-pull-dark hover:-translate-y-px',
  secondary: 'bg-voo text-white hover:bg-voo-dark',
  outline: 'border border-nuvem bg-white text-solo hover:border-voo hover:text-voo',
  ghost: 'bg-transparent text-solo hover:bg-nuvem/60',
  danger: 'bg-error text-white hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-10 px-[18px] text-[0.95rem]',
  lg: 'h-[52px] px-[30px] text-[1.05rem] font-bold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold font-sans transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
