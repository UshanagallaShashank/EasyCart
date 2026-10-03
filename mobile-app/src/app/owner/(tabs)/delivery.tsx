// Store delivery: orders on the road, cash to collect from riders, and partners nearby.
import { View } from 'react-native';
import { Text } from '@/components/text';
import { Badge, Card, EmptyState, InfoRow, Loading, Screen } from '@/components/ui';
import { useRidersNearby, useStoreDeliveries, useStoreSettlements } from '@/features/owner/owner-api';
import { distance, price, shortId } from '@/lib/format';
import { VEHICLE_LABELS, deliveryStageLabel } from '@/lib/delivery-labels';
import { colors, space, text } from '@/theme/theme';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

const ACTIVE = ['ready_for_delivery', 'rider_assigned', 'dispatched'];

export default function OwnerDelivery() {
  const deliveries = useStoreDeliveries();
  const settlements = useStoreSettlements();
  const riders = useRidersNearby();
  if (deliveries.isLoading) return <Loading />;
  const active = (deliveries.data ?? []).filter((row) => ACTIVE.includes(row.stage));
  const open = (settlements.data?.orders ?? []).filter((row) => !row.is_settled && row.net_to_store > 0);

  return (
    <Screen onRefresh={() => { void deliveries.refetch(); void settlements.refetch(); void riders.refetch(); }} refreshing={deliveries.isRefetching}>
      <Card title="On the way" icon="truck" right={<Badge tone="primary" label={String(active.length)} />}>
        {active.length === 0 ? <Text style={text.small}>No deliveries in progress.</Text> : active.map((row) => {
          const stage = deliveryStageLabel(row.stage, row.rider_offer_status);
          return (
            <Pressable key={row.id} onPress={() => router.push(`/owner/order/${row.id}`)} style={{ gap: 4, borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: space.sm }}>
              <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}><Text style={{ fontWeight: '800', color: colors.text }}>{shortId(row.id)}</Text><Badge tone={stage.tone} label={stage.label} /></View>
              <Text style={text.small} numberOfLines={1}>{row.rider_name ? `${row.rider_name} · ` : ''}{row.delivery_address}</Text>
            </Pressable>
          );
        })}
      </Card>

      <Card title="Cash from riders" icon="dollar-sign" right={<Text style={{ fontWeight: '700', color: colors.warning }}>{price(open.reduce((s, r) => s + r.net_to_store, 0))}</Text>}>
        {open.length === 0 ? <Text style={text.small}>All settled. Nothing to collect.</Text> : open.map((row) => (
          <Pressable key={row.order_id} onPress={() => router.push(`/owner/order/${row.order_id}`)}><InfoRow label={`${shortId(row.order_id)} · ${row.rider_name ?? 'Rider'}`} value={price(row.net_to_store)} /></Pressable>
        ))}
      </Card>

      <Card title="Partners near you" icon="radio">
        {(riders.data?.riders.length ?? 0) === 0 ? <EmptyState icon="users" message="No approved delivery partners yet." /> : riders.data!.riders.slice(0, 10).map((rider) => (
          <View key={rider.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: rider.is_available ? colors.success : colors.border }} />
            <View style={{ flex: 1 }}><Text style={text.body}>{rider.full_name}</Text><Text style={text.small}>{rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : 'Vehicle'} · {[rider.area, rider.city].filter(Boolean).join(', ')}</Text></View>
            <Text style={text.small}>{distance(rider.distance_km)}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
