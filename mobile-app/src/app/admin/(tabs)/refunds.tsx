// Every refund on the platform, so the admin can see which shops have problems and how they answer customers.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Badge, EmptyState, Loading, Notice, Pills, Screen, StatStrip } from '@/components/ui';
import { useAllRefunds, useTenants } from '@/features/admin/admin-api';
import { dateTime, price, shortId } from '@/lib/format';
import { colors, radius, space, text } from '@/theme/theme';
import { REFUND_REASON_LABELS, REFUND_STATUS } from '@/types/refund';

type Filter = 'waiting' | 'refunded' | 'declined' | 'all';

export default function AdminRefunds() {
  const { data, isLoading, isError, refetch, isRefetching } = useAllRefunds();
  const tenants = useTenants();
  const [filter, setFilter] = useState<Filter>('waiting');
  if (isLoading) return <Loading />;
  if (isError) return <Screen><Notice tone="warning" icon="alert-triangle">Refunds are not set up on the server yet. Run migration 011 in Supabase to turn them on.</Notice></Screen>;

  const names = new Map((tenants.data ?? []).map((tenant) => [tenant.id, tenant.name]));
  const refunds = data ?? [];
  const pick = (status: Filter) => refunds.filter((refund) => (status === 'waiting' ? refund.status === 'requested' : status === 'refunded' ? refund.status === 'refunded' : refund.status === 'rejected' || refund.status === 'failed'));
  const shown = filter === 'all' ? refunds : pick(filter);
  const refundedTotal = pick('refunded').reduce((sum, refund) => sum + Number(refund.amount), 0);

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <StatStrip items={[
        { label: 'Waiting', value: String(pick('waiting').length) },
        { label: 'Refunded', value: price(refundedTotal).replace('.00', '') },
        { label: 'Declined', value: String(pick('declined').length) }
      ]} />
      <Pills<Filter> value={filter} onChange={setFilter} options={[
        { value: 'waiting', label: 'Waiting', count: pick('waiting').length },
        { value: 'refunded', label: 'Refunded', count: pick('refunded').length },
        { value: 'declined', label: 'Declined', count: pick('declined').length },
        { value: 'all', label: 'All', count: refunds.length }
      ]} />
      {shown.length === 0 ? <EmptyState icon="check-circle" message="No refunds here." /> : shown.map((refund) => (
        <View key={refund.id} style={styles.row}>
          <View style={styles.top}>
            <Text style={styles.amount}>{price(refund.amount)}</Text>
            <Badge tone={REFUND_STATUS[refund.status].tone} label={REFUND_STATUS[refund.status].label} />
          </View>
          <Text style={text.heading} numberOfLines={1}>{names.get(refund.tenant_id) ?? 'Store'}</Text>
          <Text style={text.small}>Order {shortId(refund.order_id)} · {REFUND_REASON_LABELS[refund.reason]} · {refund.method === 'online' ? 'online' : 'cash'} · {dateTime(refund.created_at)}</Text>
          {refund.details ? <Text style={text.muted}>"{refund.details}"</Text> : null}
          {refund.decision_note ? <Text style={text.small}>Store: {refund.decision_note}</Text> : null}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { gap: 4, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount: { fontSize: 18, fontWeight: '800', color: colors.text }
});
