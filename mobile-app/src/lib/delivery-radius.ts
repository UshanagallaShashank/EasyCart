// The website's delivery-range check: a rough distance from the store's pincode to the customer's pincode,
// compared with the store's maximum delivery radius. It is only a guide; the store has the final say.
export interface DeliveryCheck {
  isEligible: boolean;
  distanceKm: number;
  maxRadiusKm: number;
  message: string;
}

export function estimateDistanceBetweenPincodes(storePincode: string | null, customerPincode: string | null): number {
  if (!storePincode || !customerPincode) return 0.8;
  if (storePincode.trim() === customerPincode.trim()) return 0.8;

  const storeNumber = parseInt(storePincode, 10);
  const customerNumber = parseInt(customerPincode, 10);
  if (Number.isNaN(storeNumber) || Number.isNaN(customerNumber)) return 1.5;

  const difference = Math.abs(storeNumber - customerNumber);
  if (difference <= 2) return 1.8;
  if (difference <= 5) return 3.5;
  if (difference <= 10) return 7;
  return Math.min(50, difference * 1.5);
}

export function checkDeliveryRange(store: { max_delivery_radius_km?: number; pincode?: string | null }, customerPincode: string | null): DeliveryCheck {
  const maxRadiusKm = store.max_delivery_radius_km ?? 10;
  const distanceKm = estimateDistanceBetweenPincodes(store.pincode ?? null, customerPincode);
  const isEligible = distanceKm <= maxRadiusKm;
  const message = isEligible
    ? `Delivers to your location (about ${distanceKm.toFixed(1)} km away)`
    : `Outside delivery range (${distanceKm.toFixed(1)} km away, max ${maxRadiusKm} km)`;
  return { isEligible, distanceKm, maxRadiusKm, message };
}
