// Straight-line distance between two points on the map, in kilometres (the haversine formula).
const EARTH_RADIUS_KM = 6371;

function to_radians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function distance_km(from_lat, from_lng, to_lat, to_lng) {
  const lat_gap = to_radians(to_lat - from_lat);
  const lng_gap = to_radians(to_lng - from_lng);
  const a =
    Math.sin(lat_gap / 2) ** 2 +
    Math.cos(to_radians(from_lat)) * Math.cos(to_radians(to_lat)) * Math.sin(lng_gap / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
