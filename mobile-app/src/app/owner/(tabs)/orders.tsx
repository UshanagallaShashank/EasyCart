// All store orders, filtered by what needs doing.
import { useState } from 'react';
import { EmptyState, Loading, Pills, Screen } from '@/components/ui';
import { orderStage, useOrders } from '@/features/owner/owner-api';
import { OrderRow } from '@/features/owner/order-row';

type View = 'open' | 'done' | 'cancelled' | 'all';

export default function OwnerOrders() {
  const { data, isLoading, refetch, isRefetching } = useOrders();
  const [view, setView] = useState<View>('open');
  const list = [...(data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const group = (order: (typeof list)[number]): View => (order.status === 'cancelled' ? 'cancelled' : orderStage(order).label === 'Completed' ? 'done' : 'open');
  const visible = view === 'all' ? list : list.filter((order) => group(order) === view);
  const count = (v: View) => (v === 'all' ? list.length : list.filter((o) => group(o) === v).length);

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Pills<View> options={[{ value: 'open', label: 'In progress', count: count('open') }, { value: 'done', label: 'Completed', count: count('done') }, { value: 'cancelled', label: 'Cancelled', count: count('cancelled') }, { value: 'all', label: 'All', count: count('all') }]} value={view} onChange={setView} />
      {isLoading ? <Loading /> : visible.length === 0 ? <EmptyState icon="clipboard" message="No orders here." /> : visible.map((order) => <OrderRow key={order.id} order={order} />)}
    </Screen>
  );
}
