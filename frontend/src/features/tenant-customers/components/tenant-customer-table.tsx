import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/empty-state';
import { useTenantCustomers } from '../hooks/use-tenant-customers';

export function TenantCustomerTable() {
  const { data: customers, isLoading } = useTenantCustomers();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!customers?.length) return <EmptyState message="No customers yet." />;

  return (
    <>
      {/* Phones: one tappable card per customer */}
      <ul className="flex flex-col gap-3 md:hidden">
        {customers.map((customer) => (
          <li key={customer.customer_id}>
            <Link
              to={`/dashboard/customers/${customer.customer_id}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs transition-colors hover:border-sky-300"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                {(customer.username ?? customer.email ?? '?').charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{customer.username ?? customer.customer_id.slice(0, 8)}</p>
                <p className="truncate text-xs text-slate-500">{customer.email ?? '—'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {customer.order_count} {customer.order_count === 1 ? 'order' : 'orders'} · Rs. {customer.lifetime_total.toFixed(2)}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Tablets and larger: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Lifetime total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customer_id} className="hover:bg-secondary/30">
                <TableCell>
                  <Link to={`/dashboard/customers/${customer.customer_id}`} className="underline">
                    {customer.username ?? customer.customer_id.slice(0, 8)}
                  </Link>
                </TableCell>
                <TableCell>{customer.email ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{customer.order_count}</TableCell>
                <TableCell className="tabular-nums">Rs. {customer.lifetime_total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
