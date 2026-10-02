// Platform at a glance.
import { Text } from 'react-native';
import { Card, InfoRow, Loading, Screen, StatStrip } from '@/components/ui';
import { useStats } from '@/features/admin/admin-api';
import { price } from '@/lib/format';
import { text } from '@/theme/theme';

export default function AdminOverview() {
  const { data, isLoading, refetch, isRefetching } = useStats();
  if (isLoading || !data) return <Loading />;
  const t = data.totals;
  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Text style={text.title}>Platform overview</Text>
      <StatStrip items={[{ label: 'Stores', value: String(t.stores) }, { label: 'Orders', value: String(t.orders) }, { label: 'Sales', value: price(t.gmv).replace('.00', '') }]} />
      <Card title="People" icon="users">
        <InfoRow label="Store owners" value={String(t.owners)} />
        <InfoRow label="Customers" value={String(t.customers)} />
        <InfoRow label="Live stores" value={String(t.active_stores)} />
        <InfoRow label="Orders waiting" value={String(t.pending_orders)} tone="warning" />
      </Card>
      <Card title="Top stores" icon="award">
        {data.top_stores.length === 0 ? <Text style={text.small}>No sales yet.</Text> : data.top_stores.slice(0, 5).map((s) => <InfoRow key={s.tenant_id} label={`${s.name} · ${s.orders} orders`} value={price(s.revenue)} />)}
      </Card>
    </Screen>
  );
}
