// Rider home cards: the online switch, a new offer with its countdown, and an order in progress.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Badge, Button } from '@/components/ui';
import { useToast } from '@/components/toast';
import { currentPosition } from '@/lib/device';
import { errorMessage } from '@/lib/api';
import { distance, price, shortId } from '@/lib/format';
import { RIDER_ORDER_STAGE } from '@/lib/delivery-labels';
import { colors, radius, shadow, space, text } from '@/theme/theme';
import type { Rider, RiderOrder } from '@/types/delivery';
import { riderCalls, useRiderAction } from './rider-api';

export function OnlineCard({ rider }: { rider: Rider }) {
  const toast = useToast();
  const toggle = useRiderAction(riderCalls.setOnline);

  // While online, share the position every two minutes so the nearest-rider match stays right.
  useEffect(() => {
    if (!rider.is_online) return;
    const timer = setInterval(() => { currentPosition().then(riderCalls.updateLocation).catch(() => undefined); }, 120_000);
    return () => clearInterval(timer);
  }, [rider.is_online]);

  async function flip() {
    const next = !rider.is_online;
    let point: { latitude: number; longitude: number } | null = null;
    if (next) {
      try { point = await currentPosition(); } catch (err) { toast(`${errorMessage(err)} Using your saved location.`, 'info'); }
    }
    toggle.mutate({ is_online: next, ...(point ?? {}) }, {
      onSuccess: () => toast(next ? 'You are online. New orders will appear here.' : 'You are offline.', 'success'),
      onError: (err) => toast(errorMessage(err), 'error')
    });
  }

  const online = rider.is_online;
  return (
    <View style={[styles.online, online ? styles.onlineOn : styles.onlineOff]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[text.label, { color: online ? '#d1fae5' : colors.textFaint }]}>Status</Text>
        <Text style={[styles.onlineTitle, { color: online ? colors.white : colors.text }]}>{online ? 'You are online' : 'You are offline'}</Text>
        <Text style={{ fontSize: 12, color: online ? '#ecfdf5' : colors.textMuted }}>{online ? 'Nearby orders are offered to you first' : 'Go online to start getting orders'}</Text>
      </View>
      <Pressable onPress={flip} disabled={toggle.isPending} accessibilityRole="switch" accessibilityState={{ checked: online }} accessibilityLabel={online ? 'Go offline' : 'Go online'}
        style={[styles.power, { backgroundColor: online ? colors.white : colors.primary }, toggle.isPending && { opacity: 0.6 }]}>
        <Feather name="power" size={26} color={online ? colors.success : colors.white} />
      </Pressable>
    </View>
  );
}

function useSecondsLeft(until: string | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return until ? Math.max(0, Math.round((new Date(until).getTime() - now) / 1000)) : 0;
}

export function OfferCard({ order }: { order: RiderOrder }) {
  const toast = useToast();
  const seconds = useSecondsLeft(order.offer_expires_at);
  const accept = useRiderAction(riderCalls.accept);
  const decline = useRiderAction(riderCalls.decline);
  const busy = accept.isPending || decline.isPending;

  return (
    <View style={styles.offer}>
      <View style={styles.offerTop}>
        <Text style={[text.label, { color: colors.primaryDark }]}>New order</Text>
        <Text style={{ fontWeight: '700', color: colors.primaryDark, fontVariant: ['tabular-nums'] }}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text>
      </View>
      <View style={{ padding: space.lg, gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: colors.text }}>{price(order.earning)}</Text>
          <Text style={text.small}>you earn</Text>
        </View>
        <Text style={text.body}><Text style={{ fontWeight: '700' }}>{order.store.name}</Text> · {distance(order.store.distance_km)} away</Text>
        {order.store.address ? <Text style={text.small}>{order.store.address}</Text> : null}
        <Text style={text.body}>{order.item_count} {order.item_count === 1 ? 'item' : 'items'} · {order.cash_to_collect > 0 ? `collect ${price(order.cash_to_collect)} cash` : 'already paid'}</Text>
        <Text style={text.small}>The drop address shows once you accept.</Text>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xs }}>
          <View style={{ flex: 1 }}><Button variant="outline" label="Decline" disabled={busy} onPress={() => decline.mutate(order.id, { onError: (e) => toast(errorMessage(e), 'error') })} /></View>
          <View style={{ flex: 1 }}><Button label="Accept" loading={accept.isPending} disabled={busy || seconds === 0} onPress={() => accept.mutate(order.id, { onSuccess: () => router.push(`/rider/order/${order.id}`), onError: (e) => toast(errorMessage(e), 'error') })} /></View>
        </View>
      </View>
    </View>
  );
}

export function ActiveOrderRow({ order }: { order: RiderOrder }) {
  const stage = RIDER_ORDER_STAGE[order.stage];
  const toStore = order.stage === 'to_pickup';
  return (
    <Pressable onPress={() => router.push(`/rider/order/${order.id}`)} style={styles.row}>
      <View style={styles.rowIcon}><Feather name={toStore ? 'shopping-bag' : 'map-pin'} size={20} color={colors.primary} /></View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}><Badge tone={stage.tone} label={stage.label} /><Text style={text.small}>{shortId(order.id)}</Text></View>
        <Text style={text.heading} numberOfLines={1}>{toStore ? order.store.name : order.delivery_address}</Text>
        <Text style={text.small}>{toStore ? 'Next: get the pickup code from the store' : "Next: ask for the customer's code"} · earn {price(order.earning)}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  online: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.lg, padding: space.lg, ...shadow },
  onlineOn: { backgroundColor: colors.success },
  onlineOff: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  onlineTitle: { fontSize: 22, fontWeight: '800' },
  power: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', ...shadow, elevation: 3 },
  offer: { borderRadius: radius.lg, borderWidth: 2, borderColor: '#38bdf8', backgroundColor: colors.card, overflow: 'hidden', ...shadow },
  offerTop: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.primarySoft, paddingHorizontal: space.lg, paddingVertical: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, ...shadow },
  rowIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }
});
