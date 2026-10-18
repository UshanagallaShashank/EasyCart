// Tells the customer, wherever they are in the app, as soon as their order moves forward.
// The first list that loads is only remembered, so old orders never trigger a message.
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useToast } from '@/components/toast';
import { useT } from '@/lib/i18n';
import type { Order } from '@/types/order';
import { useMyOrders } from './shop-api';

// Where an order is, in a few plain steps. Anything else counts as "placed".
function stageOf(order: Order): string {
  if (order.status === 'cancelled') return 'cancelled';
  if (order.status === 'fulfilled' || order.fulfillment_status === 'delivered' || order.fulfillment_status === 'picked_up') return 'delivered';
  if (order.fulfillment_status === 'dispatched') return 'out_for_delivery';
  if (order.fulfillment_status === 'ready_for_pickup') return 'ready';
  if (order.fulfillment_status === 'rider_assigned' && order.rider_offer_status === 'accepted') return 'rider_accepted';
  if (order.status === 'confirmed') return 'confirmed';
  return 'placed';
}

const MESSAGES: Record<string, string> = {
  confirmed: 'Your order was confirmed',
  rider_accepted: 'A delivery partner accepted your order',
  out_for_delivery: 'Your order is out for delivery',
  ready: 'Your order is ready to collect',
  delivered: 'Your order was delivered',
  cancelled: 'Your order was cancelled'
};

export function useOrderAlerts() {
  const { data } = useMyOrders();
  const stages = useRef<Map<string, string> | null>(null);
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    if (!data) return;
    const latest = new Map(data.map((order) => [order.id, stageOf(order)]));
    const before = stages.current;
    stages.current = latest;
    if (before === null) return;

    for (const [id, stage] of latest) {
      const was = before.get(id);
      if (was === undefined || was === stage || !MESSAGES[stage]) continue;
      toast(t(MESSAGES[stage]), stage === 'cancelled' ? 'error' : 'success');
      if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      break;
    }
  }, [data, toast, t]);
}
