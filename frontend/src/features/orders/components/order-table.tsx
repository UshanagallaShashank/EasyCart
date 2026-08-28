import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '../hooks/use-orders';

export function OrderTable() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!orders?.length) return <p className="text-muted-foreground">No orders yet.</p>;

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
          <TableRow key={order.id}>
            <TableCell>
              <Link to={`/dashboard/orders/${order.id}`} className="underline">
                {order.id.slice(0, 8)}
              </Link>
            </TableCell>
            <TableCell>${order.total.toFixed(2)}</TableCell>
            <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
            <TableCell><Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>{order.payment_status}</Badge></TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
