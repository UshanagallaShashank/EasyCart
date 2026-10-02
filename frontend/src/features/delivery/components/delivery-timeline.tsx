// Vertical list of delivery steps with the time each one happened.
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '../lib/delivery-labels';
import type { DeliveryTimeline as Timeline } from '../types/delivery-types';

const STEPS: { key: keyof Timeline; label: string }[] = [
  { key: 'placed_at', label: 'Order placed' },
  { key: 'ready_at', label: 'Packed, rider requested' },
  { key: 'accepted_at', label: 'Rider accepted' },
  { key: 'picked_up_at', label: 'Picked up from store' },
  { key: 'delivered_at', label: 'Delivered' }
];

export function DeliveryTimeline({ timeline }: { timeline: Timeline }) {
  return (
    <ol className="flex flex-col">
      {STEPS.map((step, index) => {
        const at = timeline[step.key];
        const done = Boolean(at);
        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {index < STEPS.length - 1 && <span className={cn('absolute top-6 left-[11px] h-[calc(100%-1.25rem)] w-0.5 rounded', done && timeline[STEPS[index + 1].key] ? 'bg-sky-500' : 'bg-slate-200')} />}
            <span className={cn('relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2', done ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-white')}>
              {done && <Check className="size-3.5" />}
            </span>
            <div className="min-w-0">
              <p className={cn('text-sm font-medium', done ? 'text-slate-900' : 'text-slate-400')}>{step.label}</p>
              {done && <p className="text-xs text-slate-500">{formatDateTime(at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
