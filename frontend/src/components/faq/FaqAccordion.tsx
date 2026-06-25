import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../../lib/cn';

type FaqAccordionProps = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

export function FaqAccordion({ question, answer, defaultOpen = false }: FaqAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border-b border-nuvem last:border-b-0">
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-start justify-between gap-4 py-4 text-left"
      >
        <span className="font-display text-sm font-bold text-solo sm:text-base">{question}</span>
        <ChevronDown
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0 text-cinza transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-4"
      >
        <p className="break-words text-sm leading-relaxed whitespace-pre-line text-cinza [overflow-wrap:anywhere]">
          {answer}
        </p>
      </div>
    </div>
  );
}
