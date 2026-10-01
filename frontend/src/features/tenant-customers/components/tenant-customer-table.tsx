// Searchable customer list: tappable cards on phones, a clickable table on larger screens.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { SearchField } from '@/components/search-field';
import { formatMoney, formatOrderDate } from '@/features/orders/lib/order-rules';
import { useTenantCustomers } from '../hooks/use-tenant-customers';
import { CustomerAvatar } from './customer-avatar';
import type { TenantCustomerSummary } from '../types/tenant-customer-types';

function display_name(c: TenantCustomerSummary): string {
  return c.username ?? c.email ?? c.customer_id.slice(0, 8);
}

export function TenantCustomerTable() {
  const { data: customers, isLoading } = useTenantCustomers();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (!customers?.length) return <EmptyState message="Customers appear here once they sign up or place an order." />;
  const term = search.trim().toLowerCase();
  const visible = customers.filter((c) => `${c.username ?? ''} ${c.email ?? ''}`.toLowerCase().includes(term));

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="hidden text-sm text-slate-500 md:block">{customers.length} customers</p>
        <SearchField value={search} onChange={setSearch} placeholder="Search name or email" />
      </div>
      {!visible.length && <EmptyState message="No customers match your search." />}
      <ul className="flex flex-col gap-3 md:hidden">
        {visible.map((c) => (
          <li key={c.customer_id}>
            <Link to={`/dashboard/customers/${c.customer_id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
              <CustomerAvatar id={c.customer_id} name={display_name(c)} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{display_name(c)}</p>
                <p className="truncate text-xs text-slate-500">{c.order_count} {c.order_count === 1 ? 'order' : 'orders'} · {formatMoney(c.lifetime_total)}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          </li>
        ))}
      </ul>
      {visible.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs md:block">
          <Table>
            <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="pl-5">Customer</TableHead><TableHead>Orders</TableHead><TableHead>Lifetime spend</TableHead><TableHead>Last order</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
            <TableBody>
              {visible.map((c) => (
                <TableRow key={c.customer_id} onClick={() => navigate(`/dashboard/customers/${c.customer_id}`)} className="group cursor-pointer">
                  <TableCell className="py-3 pl-5"><div className="flex items-center gap-3"><CustomerAvatar id={c.customer_id} name={display_name(c)} /><div className="min-w-0"><Link to={`/dashboard/customers/${c.customer_id}`} className="font-semibold text-slate-900 hover:text-sky-700">{display_name(c)}</Link><p className="truncate text-xs text-slate-500">{c.email ?? '—'}</p></div></div></TableCell>
                  <TableCell className="tabular-nums">{c.order_count}</TableCell>
                  <TableCell className="font-medium tabular-nums">{formatMoney(c.lifetime_total)}</TableCell>
                  <TableCell className="text-slate-500">{c.last_order_at ? formatOrderDate(c.last_order_at) : '—'}</TableCell>
                  <TableCell><ChevronRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
