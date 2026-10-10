// The delivery-range check. When we know where the customer is, it uses the real distance on the map;
// otherwise it falls back to a rough guess from the two pincodes. It is only a guide; the store has the final say.
import { distanceKm as mapDistanceKm, type Coords } from './location';

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

export function checkDeliveryRange(
  store: { max_delivery_radius_km?: number; pincode?: string | null; latitude?: number | null; longitude?: number | null },
  customerPincode: string | null,
  customerLocation?: Coords | null
): DeliveryCheck {
  const maxRadiusKm = store.max_delivery_radius_km ?? 10;
  const storeHasLocation = store.latitude != null && store.longitude != null;
  const distanceKm = customerLocation && storeHasLocation
    ? mapDistanceKm(customerLocation, { latitude: store.latitude as number, longitude: store.longitude as number })
    : estimateDistanceBetweenPincodes(store.pincode ?? null, customerPincode);
  const isEligible = distanceKm <= maxRadiusKm;
  const message = isEligible
    ? `Delivers to your location (about ${distanceKm.toFixed(1)} km away)`
    : `Outside delivery range (${distanceKm.toFixed(1)} km away, max ${maxRadiusKm} km)`;
  return { isEligible, distanceKm, maxRadiusKm, message };
}
