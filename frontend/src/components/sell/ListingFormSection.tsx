import type { ReactNode } from 'react';

type ListingFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function ListingFormSection({ title, description, children }: ListingFormSectionProps) {
  return (
    <section className="rounded-xl border border-nuvem bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold text-solo">{title}</h2>
        {description ? <p className="mt-1 text-sm text-cinza">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
