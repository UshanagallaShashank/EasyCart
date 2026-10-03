// Every delivery on the platform.
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/text';
import { Badge, Card, EmptyState, Loading, Pills, Screen } from '@/components/ui';
import { useDeliveries } from '@/features/admin/admin-api';
import { dateTime, price, shortId } from '@/lib/format';
import { deliveryStageLabel } from '@/lib/delivery-labels';
import { space, text } from '@/theme/theme';

type Filter = 'live' | 'delivered' | 'all';
const LIVE = ['ready_for_delivery', 'rider_assigned', 'dispatched'];

export default function Deliveries() {
  const { data, isLoading, refetch, isRefetching } = useDeliveries();
  const [filter, setFilter] = useState<Filter>('live');
  const rows = data ?? [];
  const match = (stage: string, f: Filter) => f === 'all' || (f === 'live' ? LIVE.includes(stage) : stage === 'delivered');
  const visible = rows.filter((r) => match(r.stage, filter));

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Pills<Filter> options={(['live', 'delivered', 'all'] as Filter[]).map((f) => ({ value: f, label: f === 'live' ? 'On the way' : f === 'delivered' ? 'Delivered' : 'All', count: rows.filter((r) => match(r.stage, f)).length }))} value={filter} onChange={setFilter} />
      {isLoading ? <Loading /> : visible.length === 0 ? <EmptyState icon="truck" message="No deliveries here." /> : visible.map((row) => {
        const stage = deliveryStageLabel(row.stage, row.rider_offer_status);
        return (
          <Card key={row.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
              <Text style={[text.heading, { flex: 1 }]} numberOfLines={1}>{row.store_name} {shortId(row.id)}</Text>
              <Badge tone={stage.tone} label={stage.label} />
            </View>
            <Text style={text.small} numberOfLines={2}>{row.rider_name ?? 'No rider'} · {row.delivery_address}</Text>
            <Text style={text.small}>{price(row.total)} · {dateTime(row.delivered_at ?? row.created_at)}</Text>
          </Card>
        );
      })}
    </Screen>
  );
}
