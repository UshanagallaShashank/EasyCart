// A rough "how far, how long" for a rider heading to the store, from their last shared position.
import { haversine_km } from './haversine-km.js';

// Typical speeds in city traffic.
const SPEED_KM_PER_HOUR = { bicycle: 12, electric_bike: 20, scooter: 22, bike: 25 };
const DEFAULT_SPEED = 20;
// Roads are longer than the straight line between two points.
const ROAD_FACTOR = 1.3;
// An older position than this is not trusted.
const FRESH_LOCATION_MS = 15 * 60 * 1000;

export function estimate_arrival(rider, destination, now = Date.now()) {
  if (!rider || !destination) return null;

  const updated_at = rider.location_updated_at ? new Date(rider.location_updated_at).getTime() : 0;
  if (now - updated_at > FRESH_LOCATION_MS) return null;

  const straight_km = haversine_km({ latitude: Number(rider.latitude), longitude: Number(rider.longitude) }, destination);
  if (straight_km === null) return null;

  const road_km = straight_km * ROAD_FACTOR;
  const speed = SPEED_KM_PER_HOUR[rider.vehicle_type] ?? DEFAULT_SPEED;
  return {
    distance_km: Math.round(road_km * 10) / 10,
    minutes: Math.max(1, Math.ceil((road_km / speed) * 60)),
    updated_at: rider.location_updated_at
  };
}
