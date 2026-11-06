import type { ReactNode } from 'react';

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

/** Cabeçalho de seção: rótulo mono, título condensado e linha de corte. */
export function SectionTitle({ eyebrow, title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-solo pb-3 sm:mb-7 sm:pb-4">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="t2f-eyebrow mb-1.5 flex items-center gap-2 text-cinza">
            <span className="inline-block h-[7px] w-[7px] bg-pull" aria-hidden />
            {eyebrow}
          </div>
        ) : null}
        <h2 className="font-display text-[1.9rem] leading-none font-bold text-solo sm:text-[2.6rem]">
          {title}
        </h2>
        {subtitle ? <p className="mt-2 hidden text-sm text-cinza sm:block">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
