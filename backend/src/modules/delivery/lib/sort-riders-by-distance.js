// Orders riders nearest-first from a point. Riders without a location come last, newest-seen first.
import { haversine_km } from './haversine-km.js';

export function with_distance(riders, origin) {
  return riders.map((rider) => {
    const km = origin ? haversine_km(origin, rider) : null;
    return { ...rider, distance_km: km === null ? null : Math.round(km * 10) / 10 };
  });
}

function seen_time(rider) {
  return rider.last_seen_at ? new Date(rider.last_seen_at).getTime() : 0;
}

export function sort_riders_by_distance(riders, origin) {
  return with_distance(riders, origin).sort((a, b) => {
    if (a.distance_km !== null && b.distance_km !== null) return a.distance_km - b.distance_km;
    if (a.distance_km !== null) return -1;
    if (b.distance_km !== null) return 1;
    return seen_time(b) - seen_time(a);
  });
}
