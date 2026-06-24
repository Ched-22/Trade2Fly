import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={textareaId} className="text-sm font-semibold text-solo">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={cn(
          'min-h-[120px] w-full resize-y rounded-md border bg-white px-3.5 py-3 font-sans text-[0.95rem] text-solo outline-none focus:ring-3 focus:ring-voo/30',
          error ? 'border-error' : 'border-nuvem',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </div>
  );
}
