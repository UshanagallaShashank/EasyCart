// Where the customer is: read it from the phone's GPS, and measure how far a shop is.
import * as Location from 'expo-location';

export interface Coords { latitude: number; longitude: number }
// "gps" means the phone found it; "map" means the customer dropped a pin.
export type LocationSource = 'gps' | 'map';
export interface MyLocation { coords: Coords; source: LocationSource }

// Asks permission, then reads where the phone is right now. Throws a plain message when it cannot.
export async function readCurrentPosition(): Promise<Coords> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error('Location is off. Allow it in your phone settings, or pick a spot on the map.');
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

// The written address for a spot on the map. Any part the phone cannot work out comes back empty.
export interface PlaceParts { street: string; city: string; state: string; zip: string }

export async function describePlace(coords: Coords): Promise<PlaceParts> {
  const [place] = await Location.reverseGeocodeAsync(coords);
  if (!place) return { street: '', city: '', state: '', zip: '' };
  const street = [place.name, place.street].filter((part, index, all) => part && all.indexOf(part) === index).join(', ');
  return {
    street,
    city: place.city ?? place.subregion ?? place.district ?? '',
    state: place.region ?? '',
    zip: place.postalCode ?? ''
  };
}

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// Straight-line distance in kilometres (the haversine formula).
export function distanceKm(from: Coords, to: Coords): number {
  const latGap = toRadians(to.latitude - from.latitude);
  const lngGap = toRadians(to.longitude - from.longitude);
  const a = Math.sin(latGap / 2) ** 2 + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(lngGap / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
