import { useParams, Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrder } from '../hooks/use-order';
import { OrderStatusControls } from '../components/order-status-controls';
import { OrderAssignmentField } from '../components/order-assignment-field';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);

  if (isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (!order) return <p className="text-muted-foreground">Order not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/dashboard/orders" className="text-muted-foreground text-sm underline">← Back to orders</Link>
      <h1 className="font-heading text-2xl">Order {order.id.slice(0, 8)}</h1>
      <div className="flex flex-wrap items-end gap-6">
        <OrderStatusControls order={order} />
        <OrderAssignmentField order={order} />
      </div>
      <div className="text-muted-foreground text-sm">
        {order.fulfillment_method === 'delivery' ? (
          <p>Delivery to: {order.delivery_address}</p>
        ) : (
          <p>Pickup at store</p>
        )}
      </div>
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
            <TableRow key={i} className="hover:bg-secondary/30">
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.variant_label ?? '—'}</TableCell>
              <TableCell className="tabular-nums">${item.price.toFixed(2)}</TableCell>
              <TableCell className="tabular-nums">{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {order.delivery_fee > 0 && <p className="text-muted-foreground text-sm tabular-nums">Delivery fee: ${order.delivery_fee.toFixed(2)}</p>}
      <p className="font-medium tabular-nums">Total: ${order.total.toFixed(2)}</p>
    </div>
  );
}
