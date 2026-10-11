// How long a delivery will roughly take: time to pack the order plus time to ride there.
// It is an honest estimate shown as a range, never an exact promise.
export interface DeliveryEstimate {
  low: number;
  high: number;
  // True when the longest wait is about half an hour or less.
  fast: boolean;
}

const PACKING_MINUTES = 10;
// About 15 km/h door to door, which allows for village roads and a stop or two.
const MINUTES_PER_KM = 4;
// Used when we do not know how far away the customer is.
const ASSUMED_KM = 2;
const RANGE_WIDTH_MINUTES = 10;
const FAST_LIMIT_MINUTES = 30;

export function estimateDelivery(distanceKm: number | null | undefined): DeliveryEstimate {
  const km = distanceKm ?? ASSUMED_KM;
  const minutes = PACKING_MINUTES + km * MINUTES_PER_KM;
  // Round to the nearest 5 minutes so the numbers look like an estimate.
  const low = Math.max(10, Math.round(minutes / 5) * 5);
  const high = low + RANGE_WIDTH_MINUTES;
  return { low, high, fast: high <= FAST_LIMIT_MINUTES };
}
