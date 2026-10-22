import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { OrderTimelineStep } from './orderTimeline';

type OrderStatusTimelineProps = {
  steps: OrderTimelineStep[];
};

export function OrderStatusTimeline({ steps }: OrderStatusTimelineProps) {
  return (
    <section aria-label="Etapas da entrega">
      <h2 className="mb-3 font-display text-lg font-bold text-solo">Entrega</h2>
      <ol className="relative space-y-0 border-l border-nuvem pl-5">
        {steps.map((step) => {
          const isDone = step.state === 'done';
          const isCurrent = step.state === 'current';
          const isSkipped = step.state === 'skipped';

          return (
            <li key={step.id} className="relative pb-5 last:pb-0">
              <span
                className={cn(
                  'absolute -left-[1.55rem] flex h-6 w-6 items-center justify-center rounded-full border text-xs',
                  isDone && 'border-liberado bg-liberado text-white',
                  isCurrent && 'border-voo bg-voo text-white',
                  isSkipped && 'border-nuvem bg-bruma text-cinza',
                  !isDone && !isCurrent && !isSkipped && 'border-nuvem bg-white text-cinza',
                )}
              >
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              </span>
              <div
                className={cn(
                  isCurrent && 'font-semibold text-solo',
                  isDone && 'text-solo',
                  (isSkipped || step.state === 'upcoming') && 'text-cinza',
                )}
              >
                <p className="text-sm">{step.label}</p>
                {step.dateLabel ? (
                  <p className="mt-0.5 text-xs text-cinza">{step.dateLabel}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
