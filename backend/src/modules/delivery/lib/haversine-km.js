// Straight-line distance in kilometres between two points on Earth.
const EARTH_RADIUS_KM = 6371;

function to_radians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function has_coordinates(point) {
  return Boolean(point) && Number.isFinite(point.latitude) && Number.isFinite(point.longitude);
}

export function haversine_km(from, to) {
  if (!has_coordinates(from) || !has_coordinates(to)) return null;
  const d_lat = to_radians(to.latitude - from.latitude);
  const d_lng = to_radians(to.longitude - from.longitude);
  const a = Math.sin(d_lat / 2) ** 2 + Math.cos(to_radians(from.latitude)) * Math.cos(to_radians(to.latitude)) * Math.sin(d_lng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}
