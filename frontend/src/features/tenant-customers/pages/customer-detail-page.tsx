import { useParams, Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getOrderStatusTone, getPaymentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useTenantCustomer } from '../hooks/use-tenant-customer';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading, isError } = useTenantCustomer(id!);

  if (isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (isError || !customer) return <p className="text-muted-foreground">Customer not found.</p>;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
      <Link to="/dashboard/customers" className="text-muted-foreground text-sm underline">← Back to customers</Link>
      <h1 className="font-heading text-2xl">{customer.username ?? customer.customer_id.slice(0, 8)}</h1>
      <p className="text-muted-foreground text-sm">{customer.email}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customer.orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-secondary/30">
              <TableCell>
                <Link to={`/dashboard/orders/${order.id}`} className="underline">{order.id.slice(0, 8)}</Link>
              </TableCell>
              <TableCell className="tabular-nums">${order.total.toFixed(2)}</TableCell>
              <TableCell><Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge></TableCell>
              <TableCell><Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge></TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
