import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { getOrderStatusTone, getPaymentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useMyOrders } from '../hooks/use-my-orders';

export function CustomerOrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-heading text-2xl">My orders</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !orders?.length ? (
        <EmptyState message="No orders yet." />
      ) : (
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
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-secondary/30">
                <TableCell>
                  <Link to={`/customer/orders/${order.id}`} className="underline">{order.id.slice(0, 8)}</Link>
                </TableCell>
                <TableCell className="tabular-nums">${order.total.toFixed(2)}</TableCell>
                <TableCell><Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge></TableCell>
                <TableCell><Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge></TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
