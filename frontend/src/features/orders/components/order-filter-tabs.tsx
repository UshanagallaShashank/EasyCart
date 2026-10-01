// Pill buttons that filter the order list by status, each showing how many orders match.
import { cn } from '@/lib/utils';

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
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
            value === filter.value
              ? 'border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-500/30'
              : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700'
          )}
        >
          {filter.label}
          <span className={cn('rounded-full px-1.5 text-[10px] font-semibold', value === filter.value ? 'bg-white/25' : 'bg-slate-100 text-slate-500')}>
            {counts[filter.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
