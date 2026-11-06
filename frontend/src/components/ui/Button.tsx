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
    'bg-pull text-white hover:bg-solo',
  secondary: 'bg-solo text-white hover:bg-pull',
  outline: 'border border-solo bg-transparent text-solo hover:bg-solo hover:text-white',
  ghost: 'bg-transparent text-solo hover:bg-nuvem/60',
  danger: 'bg-error text-white hover:bg-solo',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-10 px-5 text-[0.8rem]',
  lg: 'h-[52px] px-8 text-[0.875rem] font-bold',
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
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold font-sans uppercase tracking-[0.09em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
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
