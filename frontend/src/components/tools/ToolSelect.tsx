import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type ToolSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function ToolSelect({ label, className, id, children, ...props }: ToolSelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-semibold text-solo">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          'h-11 w-full rounded-md border border-nuvem bg-white px-3.5 font-sans text-[0.95rem] text-solo outline-none focus:ring-3 focus:ring-voo/30',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
