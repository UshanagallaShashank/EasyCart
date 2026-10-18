// A buzz and a banner when a new order arrives, on whichever owner screen is open.
// The first list that loads is only remembered, so orders that were already there never buzz.
import { useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useToast } from '@/components/toast';
import { price } from '@/lib/format';
import { useT } from '@/lib/i18n';
import type { Order } from '@/types/order';

export function useNewOrderAlert(orders: Order[] | undefined) {
  const seen = useRef<Set<string> | null>(null);
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    if (!orders) return;
    if (seen.current === null) {
      seen.current = new Set(orders.map((order) => order.id));
      return;
    }
    const known = seen.current;
    const fresh = orders.filter((order) => !known.has(order.id));
    fresh.forEach((order) => known.add(order.id));
    if (fresh.length === 0) return;

    toast(t('New order · {amount}', { amount: price(fresh[0].total) }), 'info');
    if (Platform.OS === 'web') return;
    Vibration.vibrate([0, 300, 150, 300]);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [orders, toast, t]);
}
