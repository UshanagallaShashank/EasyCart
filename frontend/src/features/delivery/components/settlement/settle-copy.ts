// Wording for each side of a settlement, kept in one place so both screens read the same way.
import type { SettleSide } from '../../hooks/use-settle';

export const SETTLE_COPY: Record<SettleSide, { owe: string; action: string; done: string; counterpartFallback: string }> = {
  store: { owe: 'To receive from rider', action: 'Mark received', done: 'Cash received from the rider', counterpartFallback: 'the rider' },
  rider: { owe: 'To hand to store', action: 'Mark paid', done: 'Cash handed to the store', counterpartFallback: 'the store' }
};
