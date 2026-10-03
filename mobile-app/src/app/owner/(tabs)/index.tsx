// Store overview: today's numbers and orders that need the owner now.
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Button, EmptyState, Loading, Notice, Screen, SectionTitle, StatStrip } from '@/components/ui';
import { useOrders, useOwnStore } from '@/features/owner/owner-api';
import { OrderRow } from '@/features/owner/order-row';
import { price } from '@/lib/format';
import { text } from '@/theme/theme';

export default function OwnerOverview() {
  const store = useOwnStore();
  const orders = useOrders();
  if (orders.isLoading) return <Loading />;
  const list = [...(orders.data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const today = new Date().toDateString();
  const todays = list.filter((o) => new Date(o.created_at).toDateString() === today && o.status !== 'cancelled');
  const needsYou = list.filter((o) => o.status === 'pending' || (o.status === 'confirmed' && o.fulfillment_status === 'not_started'));

  return (
    <Screen onRefresh={() => void orders.refetch()} refreshing={orders.isRefetching}>
      <Text style={text.title}>{store.data?.name ?? 'Your store'}</Text>
      {store.data && !store.data.is_published && <Notice tone="warning" icon="eye-off">Your store is not published, so customers cannot see it. Publish it from the website's Store settings.</Notice>}
      {store.data && store.data.latitude == null && <Notice icon="map-pin">Pin your store location in Store settings on the website so deliveries go to the nearest rider.</Notice>}
      <StatStrip items={[
        { label: 'Orders today', value: String(todays.length) },
        { label: 'Sales today', value: price(todays.reduce((s, o) => s + Number(o.total), 0)).replace('.00', '') },
        { label: 'Need you', value: String(needsYou.length) }
      ]} />
      <SectionTitle right={<Button small variant="ghost" label="All orders" onPress={() => router.navigate('/owner/orders')} />}>Needs your attention</SectionTitle>
      {needsYou.length === 0 ? <EmptyState icon="check-circle" message="You are all caught up." /> : needsYou.slice(0, 10).map((order) => <OrderRow key={order.id} order={order} />)}
    </Screen>
  );
}
