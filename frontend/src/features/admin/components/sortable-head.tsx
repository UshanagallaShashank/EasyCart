// Table header that sorts the store list when clicked, showing an arrow on the active sort.
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { TenantSort } from '../hooks/use-tenant-list-filter';

interface SortableHeadProps {
  label: string;
  sorts: TenantSort[];
  current?: TenantSort;
  onSort?(sort: TenantSort): void;
  className?: string;
  ascending?: TenantSort[];
}

export function SortableHead({ label, sorts, current, onSort, className, ascending = [] }: SortableHeadProps) {
  const active = current !== undefined && sorts.includes(current);
  const next = active ? sorts[(sorts.indexOf(current!) + 1) % sorts.length] : sorts[0];
  const Arrow = !active ? ArrowUpDown : ascending.includes(current!) ? ArrowUp : ArrowDown;
  if (!onSort) return <TableHead className={className}>{label}</TableHead>;

  return (
    <TableHead className={className} aria-sort={active ? (ascending.includes(current!) ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => onSort(next)} className={cn('inline-flex items-center gap-1 rounded-md hover:text-slate-900', active ? 'text-slate-900' : 'text-slate-600')}>
        {label}<Arrow className={cn('size-3.5', active ? 'text-sky-600' : 'text-slate-300')} />
      </button>
    </TableHead>
  );
}
