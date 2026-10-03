// Earnings, cash still to hand to stores, and settling each delivered cash order.
import { View } from 'react-native';
import { Text } from '@/components/text';
import { Badge, Button, Card, EmptyState, InfoRow, Loading, Screen, StatStrip } from '@/components/ui';
import { useToast } from '@/components/toast';
import { riderCalls, useRiderAction, useRiderEarnings, useRiderSettlements } from '@/features/rider/rider-api';
import { errorMessage } from '@/lib/api';
import { dateTime, price, shortId } from '@/lib/format';
import { colors, space, text } from '@/theme/theme';

export default function EarningsScreen() {
  const { data, isLoading, refetch, isRefetching } = useRiderEarnings();
  const settlements = useRiderSettlements();
  const pay = useRiderAction(riderCalls.payStore);
  const toast = useToast();
  if (isLoading || !data) return <Loading />;
  const open = (settlements.data?.orders ?? []).filter((row) => !row.is_settled && row.net_to_store > 0);
  const s = data.summary;

  return (
    <Screen onRefresh={() => { void refetch(); void settlements.refetch(); }} refreshing={isRefetching}>
      <StatStrip items={[{ label: 'Today', value: price(s.earnings_today) }, { label: 'Last 7 days', value: price(s.earnings_this_week) }, { label: 'All time', value: price(s.earnings) }]} />
      <Card title="Money" icon="credit-card">
        <InfoRow label="Deliveries" value={String(s.deliveries)} />
        <InfoRow label="Cash collected" value={price(s.cash_collected)} />
        <InfoRow label="Cash still to hand in" value={price(s.cash_in_hand)} tone="warning" />
        <InfoRow label="Payout due" value={price(s.payout_due)} tone="success" />
      </Card>

      <Card title="Cash to hand to stores" icon="shopping-bag" right={<Badge tone={open.length ? 'warning' : 'success'} label={open.length ? `${open.length} open` : 'All settled'} />}>
        <Text style={text.small}>For cash orders, give the store the order total minus your delivery fee.</Text>
        {open.length === 0 ? <EmptyState icon="check-circle" message="Nothing to hand in." /> : open.map((row) => (
          <View key={row.order_id} style={{ gap: 6, borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: space.md }}>
            <Text style={text.heading}>{row.store_name} {shortId(row.order_id)}</Text>
            <Text style={text.small}>Delivered {dateTime(row.delivered_at)} · cash {price(row.cash_collected)} · fee {price(row.rider_earning)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{price(row.net_to_store)}</Text>
              <Button small label="Mark paid (cash)" loading={pay.isPending} onPress={() => pay.mutate({ id: row.order_id, method: 'cash' }, { onSuccess: () => toast('Marked as paid to the store', 'success'), onError: (e) => toast(errorMessage(e), 'error') })} />
            </View>
          </View>
        ))}
      </Card>

      <Card title="Cash deposits and payouts" icon="list">
        {data.settlements.length === 0 ? <Text style={text.small}>Nothing recorded yet.</Text> : data.settlements.map((row) => (
          <InfoRow key={row.id} label={`${row.kind === 'cash_deposit' ? 'Cash handed in' : 'Payout'} · ${dateTime(row.created_at)}`} value={price(row.amount)} />
        ))}
      </Card>
    </Screen>
  );
}
