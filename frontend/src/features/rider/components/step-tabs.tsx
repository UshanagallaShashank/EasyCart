// Numbered step tabs for the application; finished steps get a tick and any step can be opened.
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepDef<T extends string> {
  key: T;
  label: string;
  done: boolean;
}

export function StepTabs<T extends string>({ steps, current, onChange }: { steps: StepDef<T>[]; current: T; onChange(step: T): void }) {
  return (
    <ol className="grid grid-cols-4 gap-1.5 sm:gap-3">
      {steps.map((step, index) => {
        const active = step.key === current;
        return (
          <li key={step.key}>
            <button type="button" onClick={() => onChange(step.key)} aria-current={active ? 'step' : undefined}
              className={cn('flex w-full flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-center transition-colors sm:flex-row sm:px-3 sm:text-left',
                active ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
              <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                step.done ? 'bg-emerald-500 text-white' : active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500')}>
                {step.done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className={cn('truncate text-[11px] font-semibold sm:text-xs', active ? 'text-sky-800' : 'text-slate-600')}>{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
