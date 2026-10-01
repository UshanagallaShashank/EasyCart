// Visual progress for an order: Placed -> Confirmed -> Fulfilled, or a cancelled banner.
import { Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '../types/order-types';

const STEPS = ['Placed', 'Confirmed', 'Fulfilled'];

function getCurrentStep(status: Order['status']): number {
  if (status === 'confirmed') return 1;
  if (status === 'fulfilled') return 2;
  return 0;
}

export function OrderProgress({ status }: { status: Order['status'] }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
        <XCircle className="size-4" /> This order was cancelled
      </div>
    );
  }

  const currentStep = getCurrentStep(status);

  return (
    <ol className="flex items-center">
      {STEPS.map((label, index) => {
        const isDone = index <= currentStep;
        return (
          <li key={label} className={cn('flex items-center', index < STEPS.length - 1 && 'flex-1')}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                  isDone ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-400'
                )}
              >
                {isDone ? <Check className="size-4" /> : index + 1}
              </span>
              <span className={cn('text-xs font-medium', isDone ? 'text-slate-900' : 'text-slate-400')}>{label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <span className={cn('mx-2 mb-5 h-0.5 flex-1 rounded', index < currentStep ? 'bg-sky-500' : 'bg-slate-200')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
