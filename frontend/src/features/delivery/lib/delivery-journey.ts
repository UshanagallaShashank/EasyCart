// One simple journey every person sees for a delivery, whatever the order's internal statuses are:
//   Packing -> Finding a rider -> Rider picking up -> Out for delivery -> Delivered
import type { DeliveryStage } from '../types/delivery-types';

export const JOURNEY_STEPS = ['Packing', 'Finding a rider', 'Rider picking up', 'Out for delivery', 'Delivered'];

export type JourneyRole = 'store' | 'customer';

export interface JourneyArrival {
  distance_km: number;
  minutes: number;
}

// Which of the five steps the delivery is on right now, or null when it was cancelled.
export function getJourneyIndex(stage: DeliveryStage, offerStatus: 'offered' | 'accepted' | null): number | null {
  if (stage === 'cancelled') return null;
  if (stage === 'not_started') return 0;
  if (stage === 'ready_for_delivery') return 1;
  if (stage === 'rider_assigned') return offerStatus === 'accepted' ? 2 : 1;
  if (stage === 'dispatched') return 3;
  return 4;
}

function arrivalText(arrival: JourneyArrival | null): string {
  if (!arrival) return '';
  return ` (about ${arrival.minutes} min away, ${arrival.distance_km} km from the store)`;
}

// One plain sentence: what is happening now, and what this person should do.
export function getJourneyHint(role: JourneyRole, index: number, riderName: string | null, arrival: JourneyArrival | null): string {
  const rider = riderName ?? 'Your delivery partner';

  if (role === 'store') {
    if (index === 0) return 'Pack the order, then tap "Packed, send for delivery". We find the nearest rider for you.';
    if (index === 1) return 'Looking for the nearest rider. If one does not answer within 2 minutes, we try the next one automatically.';
    if (index === 2) return `${rider} is on the way to your store${arrivalText(arrival)}. Check their photo and number plate, then give them the pickup code.`;
    if (index === 3) return `${rider} has the order and is taking it to the customer.`;
    return 'Delivered. The proof photo and the cash collected are shown below.';
  }

  if (index === 0) return 'The store is getting your order ready.';
  if (index === 1) return 'Your order is packed. We are finding a delivery partner.';
  if (index === 2) return `${rider} is on the way to the store to pick up your order${arrivalText(arrival)}.`;
  if (index === 3) return `${rider} is bringing your order. Give them your code only when you have the order in your hands.`;
  return 'Delivered. Enjoy your order!';
}
