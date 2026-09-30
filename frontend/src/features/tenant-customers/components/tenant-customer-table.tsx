import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/empty-state';
import { useTenantCustomers } from '../hooks/use-tenant-customers';

export function TenantCustomerTable() {
  const { data: customers, isLoading } = useTenantCustomers();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!customers?.length) return <EmptyState message="No customers yet." />;

  return (
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
            <TableCell className="tabular-nums">${customer.lifetime_total.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
