import { useParams, Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrder } from '../hooks/use-order';
import { OrderStatusControls } from '../components/order-status-controls';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);

  if (isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (!order) return <p className="text-muted-foreground">Order not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/dashboard/orders" className="text-muted-foreground text-sm underline">← Back to orders</Link>
      <h1 className="text-lg font-medium">Order {order.id.slice(0, 8)}</h1>
      <OrderStatusControls order={order} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.variant_label ?? '—'}</TableCell>
              <TableCell>${item.price.toFixed(2)}</TableCell>
              <TableCell>{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="font-medium">Total: ${order.total.toFixed(2)}</p>
    </div>
  );
}
