import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { getOrderStatusTone, getPaymentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useOrders } from '../hooks/use-orders';

export function OrderTable() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!orders?.length) return <EmptyState message="No orders yet." />;

  return (
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
              <Link to={`/dashboard/orders/${order.id}`} className="underline">
                {order.id.slice(0, 8)}
              </Link>
            </TableCell>
            <TableCell className="tabular-nums">${order.total.toFixed(2)}</TableCell>
            <TableCell><Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge></TableCell>
            <TableCell><Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge></TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
