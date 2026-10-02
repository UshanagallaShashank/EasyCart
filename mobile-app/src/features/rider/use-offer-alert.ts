// A buzz for every new order offer, so the rider notices it even with the phone in a pocket.
import { useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { RiderOrder } from '@/types/delivery';

export function useOfferAlert(offers: RiderOrder[] | undefined) {
  const seen = useRef(new Set<string>());
  useEffect(() => {
    const fresh = (offers ?? []).filter((offer) => !seen.current.has(offer.id));
    fresh.forEach((offer) => seen.current.add(offer.id));
    if (fresh.length === 0 || Platform.OS === 'web') return;
    Vibration.vibrate([0, 250, 120, 250]);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [offers]);
}
