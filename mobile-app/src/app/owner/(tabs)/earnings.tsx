// What the shop keeps: sales, the platform fee, and a bar for each of the last 7 days.
import { Text } from '@/components/text';
import { DayBars, TotalsRows, rupees } from '@/components/earnings-view';
import { Card, EmptyState, HeroHeader, Loading, Notice, Screen, StatStrip } from '@/components/ui';
import { useEarnings } from '@/features/owner/owner-api';
import { accents, text } from '@/theme/theme';

export default function OwnerEarnings() {
  const { data, isLoading, isError, refetch, isRefetching } = useEarnings();
  if (isLoading) return <Loading />;
  if (isError || !data) return <Screen><EmptyState icon="wallet" message="We could not load your earnings. Pull down to try again." /></Screen>;

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <HeroHeader title="What you keep" subtitle={`Platform fee: ${data.commission_percent}% of items on delivered orders`} icon="wallet" />

      <StatStrip items={[
        { label: 'Delivered (7 days)', value: String(data.last_7_days.orders) },
        { label: 'Sold', value: rupees(data.last_7_days.items_value) },
        { label: 'You keep', value: rupees(data.last_7_days.shop_keeps) }
      ]} />

      <Card title="Last 7 days" icon="clock">
        <Text style={text.small}>What you kept each day, after the platform fee.</Text>
        <DayBars days={data.by_day} pick={(day) => day.shop_keeps} color={accents.green.fg} />
        <TotalsRows totals={data.last_7_days} owner />
      </Card>

      <Card title="All time" icon="award">
        <TotalsRows totals={data.all_time} owner />
      </Card>

      <Notice icon="info">The fee is only taken on orders that were delivered. Cancelled orders cost you nothing. If you deliver an order yourself, you also keep its delivery fee.</Notice>
    </Screen>
  );
}
