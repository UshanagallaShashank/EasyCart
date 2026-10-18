// While the rider is online, sends their GPS position every two minutes so the nearest-rider match stays accurate.
import { useEffect } from 'react';
import { updateLocation } from '@/features/delivery/api/rider-api';
import { readCurrentPosition } from '@/features/delivery/lib/use-current-position';

const EVERY_MS = 2 * 60 * 1000;

export function useLocationHeartbeat(isOnline: boolean) {
  useEffect(() => {
    if (!isOnline) return;
    const timer = window.setInterval(() => {
      readCurrentPosition().then(updateLocation).catch(() => undefined);
    }, EVERY_MS);
    return () => window.clearInterval(timer);
  }, [isOnline]);
}
