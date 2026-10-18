// The rider's own four steps for one delivery, with one sentence about what to do now.
import { JourneyTracker, CancelledBanner } from '@/features/delivery/components/delivery-journey';
import type { RiderOrderStage } from '@/features/delivery/types/delivery-types';

const STEPS = ['New offer', 'Go to store', 'Deliver', 'Done'];

const CURRENT: Partial<Record<RiderOrderStage, number>> = { offered: 0, to_pickup: 1, to_customer: 2, delivered: 3 };

const HINT: Record<string, string> = {
  offered: 'A new delivery. Accept it within 2 minutes, or it goes to the next rider.',
  to_pickup: 'Go to the store. When you arrive, ask for the 4-digit pickup code.',
  to_customer: 'Take it to the customer. Ask for their 6-digit code, take a photo at the door, and collect the exact cash.',
  delivered: 'Delivered. Well done!',
  ready_for_delivery: 'The store took this order back. Nothing more to do here.'
};

export function RiderJourney({ stage }: { stage: RiderOrderStage }) {
  if (stage === 'cancelled') return <CancelledBanner />;
  const current = CURRENT[stage];
  if (current === undefined) return <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">{HINT[stage]}</p>;
  return <JourneyTracker steps={STEPS} current={current} hint={HINT[stage]} />;
}
