import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export type ProofProgressStep = {
  id: string;
  label: string;
  complete: boolean;
};

type ProofProgressStepsProps = {
  steps: ProofProgressStep[];
};

export function ProofProgressSteps({ steps }: ProofProgressStepsProps) {
  const completedCount = steps.filter((step) => step.complete).length;

  return (
    <div className="rounded-xl border border-nuvem bg-bruma/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-solo">
          Progresso · {completedCount}/{steps.length}
        </p>
        <div className="h-2 flex-1 max-w-[140px] overflow-hidden rounded-full bg-nuvem">
          <div
            className="h-full rounded-full bg-liberado transition-all duration-300"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <ol
        className={cn(
          'grid gap-2',
          steps.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
        )}
      >
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
              step.complete ? 'bg-liberado-light text-liberado-dark' : 'bg-white text-cinza',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                step.complete ? 'bg-liberado text-white' : 'bg-nuvem text-cinza',
              )}
            >
              {step.complete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </span>
            <span className={cn('font-medium', step.complete && 'font-semibold')}>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
