// Asks the phone for its GPS position once, with a friendly message when it is refused or unavailable.
import { useState } from 'react';

export interface Point {
  latitude: number;
  longitude: number;
}

function explain(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) return 'Location permission was denied. Allow location for this site in your browser settings.';
  if (error.code === error.TIMEOUT) return 'Finding your location took too long. Try again outside or near a window.';
  return 'Your location is not available right now.';
}

export function readCurrentPosition(): Promise<Point> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('This browser cannot share location.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) }),
      (error) => reject(new Error(explain(error))),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export function useCurrentPosition() {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');

  async function locate(): Promise<Point | null> {
    setIsLocating(true);
    setError('');
    try {
      return await readCurrentPosition();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location is not available');
      return null;
    } finally {
      setIsLocating(false);
    }
  }

  return { locate, isLocating, error };
}
