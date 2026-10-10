// Pill buttons that filter the order list by status, each showing how many orders match.
import { FilterPills } from '@/components/filter-pills';

export type OrderFilter = 'all' | 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';

const FILTERS: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' }
];

interface OrderFilterTabsProps {
  value: OrderFilter;
  counts: Record<OrderFilter, number>;
  onChange: (value: OrderFilter) => void;
}

export function OrderFilterTabs({ value, counts, onChange }: OrderFilterTabsProps) {
  return <FilterPills<OrderFilter> options={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))} value={value} onChange={onChange} />;
}
