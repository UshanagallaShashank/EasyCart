// The store's refund requests: waiting ones first, then everything already decided.
import { useState } from 'react';
import { EmptyState, Loading, Notice, Pills, Screen } from '@/components/ui';
import { useStoreRefunds } from '@/features/owner/owner-api';
import { RefundRow } from '@/features/owner/refund-row';

type Filter = 'waiting' | 'done' | 'all';

export default function OwnerRefunds() {
  const { data, isLoading, isError, refetch, isRefetching } = useStoreRefunds();
  const [filter, setFilter] = useState<Filter>('waiting');
  if (isLoading) return <Loading />;
  if (isError) return <Screen><Notice tone="warning" icon="alert-triangle">Refunds are not set up on the server yet. Run migration 011 in Supabase to turn them on.</Notice></Screen>;

  const refunds = data ?? [];
  const waiting = refunds.filter((refund) => refund.status === 'requested');
  const done = refunds.filter((refund) => refund.status !== 'requested');
  const shown = filter === 'waiting' ? waiting : filter === 'done' ? done : refunds;

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Pills<Filter> value={filter} onChange={setFilter} options={[
        { value: 'waiting', label: 'Waiting', count: waiting.length },
        { value: 'done', label: 'Decided', count: done.length },
        { value: 'all', label: 'All', count: refunds.length }
      ]} />
      {shown.length === 0
        ? <EmptyState icon="check-circle" message={filter === 'waiting' ? 'No refund requests waiting.' : 'No refunds here yet.'} />
        : shown.map((refund) => <RefundRow key={refund.id} refund={refund} />)}
    </Screen>
  );
}
