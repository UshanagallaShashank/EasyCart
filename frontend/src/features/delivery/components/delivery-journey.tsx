// The five-step delivery tracker with one plain sentence about what is happening now.
import { Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JOURNEY_STEPS, getJourneyHint, getJourneyIndex, type JourneyArrival, type JourneyRole } from '../lib/delivery-journey';
import type { DeliveryStage } from '../types/delivery-types';

interface JourneyTrackerProps {
  steps: string[];
  current: number;
  hint: string;
}

// The numbered steps with the current one pulsing, and one sentence under them.
export function JourneyTracker({ steps, current, hint }: JourneyTrackerProps) {
  const last = steps.length - 1;
  return (
    <div className="flex flex-col gap-3">
      <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((label, index) => {
          const done = index < current || current === last;
          const active = index === current && current !== last;
          return (
            <li key={label} className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex w-full items-center">
                <span className={cn('h-0.5 flex-1', index === 0 ? 'bg-transparent' : index <= current ? 'bg-sky-500' : 'bg-slate-200')} />
                <span
                  className={cn(
                    'relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                    done && 'border-sky-500 bg-sky-500 text-white',
                    active && 'border-sky-500 bg-white text-sky-600',
                    !done && !active && 'border-slate-200 bg-white text-slate-400'
                  )}
                >
                  {active && <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/30" />}
                  {done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className={cn('h-0.5 flex-1', index === last ? 'bg-transparent' : index < current ? 'bg-sky-500' : 'bg-slate-200')} />
              </span>
              <span className={cn('text-[10px] leading-tight font-medium sm:text-xs', done || active ? 'text-slate-900' : 'text-slate-400')}>{label}</span>
            </li>
          );
        })}
      </ol>
      <p className="rounded-xl bg-sky-50 px-3.5 py-2.5 text-sm text-sky-900">{hint}</p>
    </div>
  );
}

interface DeliveryJourneyProps {
  stage: DeliveryStage;
  offerStatus: 'offered' | 'accepted' | null;
  role: JourneyRole;
  riderName?: string | null;
  arrival?: JourneyArrival | null;
}

export function DeliveryJourney({ stage, offerStatus, role, riderName = null, arrival = null }: DeliveryJourneyProps) {
  const current = getJourneyIndex(stage, offerStatus);

  if (current === null) return <CancelledBanner />;
  return <JourneyTracker steps={JOURNEY_STEPS} current={current} hint={getJourneyHint(role, current, riderName, arrival)} />;
}

export function CancelledBanner() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
      <XCircle className="size-4 shrink-0" /> This delivery was cancelled.
    </div>
  );
}
