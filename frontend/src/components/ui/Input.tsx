import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export function Input({
  label,
  error,
  prefix,
  suffix,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="t2f-eyebrow text-solo">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'flex h-11 items-center gap-2 rounded-md border bg-white px-3.5',
          error ? 'border-error' : 'border-nuvem focus-within:border-solo focus-within:ring-1 focus-within:ring-solo',
        )}
      >
        {prefix}
        <input
          id={inputId}
          className={cn(
            'min-w-0 flex-1 border-none bg-transparent font-sans text-[0.95rem] text-solo outline-none',
            className,
          )}
          {...props}
        />
        {suffix}
      </div>
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </div>
  );
}
