// A buzz and a banner for every new order offer, on whichever rider screen is open, so it is noticed even from a pocket.
import { useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useToast } from '@/components/toast';
import { price } from '@/lib/format';
import { useT } from '@/lib/i18n';
import type { RiderOrder } from '@/types/delivery';

export function useOfferAlert(offers: RiderOrder[] | undefined) {
  const seen = useRef(new Set<string>());
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    const fresh = (offers ?? []).filter((offer) => !seen.current.has(offer.id));
    fresh.forEach((offer) => seen.current.add(offer.id));
    if (fresh.length === 0) return;
    // The banner says what matters most to a rider first: that there is an order and what it pays.
    toast(t('New order · you earn {amount}', { amount: price(fresh[0].earning) }), 'info');
    if (Platform.OS === 'web') return;
    Vibration.vibrate([0, 250, 120, 250]);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [offers, toast, t]);
}
