// Dropdown for choosing how storefront products are ordered.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductSort } from '../utils/sort-products';

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' }
];

export function ProductSortSelect({ value, onChange }: { value: ProductSort; onChange(sort: ProductSort): void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ProductSort)}>
      <SelectTrigger aria-label="Sort products" className="!h-11 w-full rounded-full border-slate-200 bg-white px-4 shadow-2xs sm:w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
