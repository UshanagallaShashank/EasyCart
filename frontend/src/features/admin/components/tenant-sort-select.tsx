// Sort order picker for the platform admin store list.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TenantSort } from '../hooks/use-tenant-list-filter';

const SORT_LABELS: Record<TenantSort, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  name: 'Name A–Z',
  revenue: 'Highest revenue',
  customers: 'Most customers'
};

export function TenantSortSelect({ value, onChange }: { value: TenantSort; onChange(sort: TenantSort): void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TenantSort)}>
      <SelectTrigger aria-label="Sort stores" className="!h-10 w-full rounded-xl bg-white md:w-40"><SelectValue /></SelectTrigger>
      <SelectContent>{(Object.keys(SORT_LABELS) as TenantSort[]).map((s) => <SelectItem key={s} value={s}>{SORT_LABELS[s]}</SelectItem>)}</SelectContent>
    </Select>
  );
}
