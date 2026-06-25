import { Shield } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { FaqAccordion } from './FaqAccordion';
import type { FaqSection as FaqSectionType } from '../../data/faqContent';

type FaqSectionProps = {
  section: FaqSectionType;
  emphasized?: boolean;
};

export function FaqSectionBlock({ section, emphasized = false }: FaqSectionProps) {
  return (
    <section id={section.id} className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-solo sm:text-2xl">
          {section.title}
        </h2>
        {emphasized ? (
          <Badge variant="escrow">
            <Shield className="mr-1 inline h-3.5 w-3.5" />
            Pagamento protegido
          </Badge>
        ) : null}
      </div>
      <div className="rounded-xl border border-nuvem bg-white px-4 sm:px-5">
        {section.items.map((item, index) => (
          <FaqAccordion
            key={item.id}
            question={item.question}
            answer={item.answer}
            defaultOpen={emphasized && index === 0}
          />
        ))}
      </div>
    </section>
  );
}
