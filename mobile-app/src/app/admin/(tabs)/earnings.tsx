// What the platform earns: commission from shops, its share of delivery fees, and a list of what each shop owes.
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { DayBars, TotalsRows, rupees } from '@/components/earnings-view';
import { Card, EmptyState, HeroHeader, Loading, Notice, Screen, StatStrip } from '@/components/ui';
import { usePlatformEarnings } from '@/features/admin/admin-api';
import { accents, colors, space, text } from '@/theme/theme';

export default function PlatformEarningsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = usePlatformEarnings();
  if (isLoading) return <Loading />;
  if (isError || !data) return <Screen><EmptyState icon="wallet" message="We could not load earnings. Pull down to try again." /></Screen>;

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <HeroHeader title="Platform earnings" subtitle={`${data.commission_percent}% commission, riders keep ${data.rider_share_percent}% of the delivery fee`} icon="wallet" />

      <StatStrip items={[
        { label: 'Delivered (7 days)', value: String(data.last_7_days.orders) },
        { label: 'Sold', value: rupees(data.last_7_days.items_value) },
        { label: 'You earn', value: rupees(data.last_7_days.platform_earns) }
      ]} />

      <Card title="Last 7 days" icon="clock">
        <Text style={text.small}>What the platform earned each day.</Text>
        <DayBars days={data.by_day} pick={(day) => day.platform_earns} color={accents.violet.fg} />
        <TotalsRows totals={data.last_7_days} owner={false} />
      </Card>

      <Card title="All time" icon="award">
        <TotalsRows totals={data.all_time} owner={false} />
      </Card>

      <Card title="By shop" icon="store">
        <Text style={text.small}>Commission each shop owes you on delivered orders, all time.</Text>
        {data.per_store.length === 0 ? <Text style={text.muted}>Delivered orders will show up here.</Text> : data.per_store.map((store) => (
          <View key={store.tenant_id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={text.heading} numberOfLines={1}>{store.name}</Text>
              <Text style={text.small}>{store.orders} {store.orders === 1 ? 'order' : 'orders'} · {rupees(store.items_value)} sold</Text>
            </View>
            <Text style={styles.owes}>{rupees(store.commission)}</Text>
          </View>
        ))}
      </Card>

      <Notice icon="info">These numbers are worked out from delivered orders. Collect each shop's commission from them, for example weekly. Change the rates with PLATFORM_COMMISSION_PERCENT and RIDER_SHARE_PERCENT on the server.</Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  owes: { fontSize: 15, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] }
});
