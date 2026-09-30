import { useParams, Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getOrderStatusTone, getPaymentStatusTone, getFulfillmentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useMyOrder } from '../hooks/use-my-order';

export function CustomerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useMyOrder(id!);

  if (isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (isError || !order) return <p className="p-6 text-muted-foreground">Order not found.</p>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link to="/customer/orders" className="text-muted-foreground text-sm underline">← Back to orders</Link>
      <h1 className="font-heading text-2xl">Order {order.id.slice(0, 8)}</h1>
      <div className="flex flex-wrap gap-2">
        <Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge>
        <Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge>
        <Badge className={STATUS_TONE_CLASSNAME[getFulfillmentStatusTone(order.fulfillment_status)]}>
          {order.fulfillment_status.replaceAll('_', ' ')}
        </Badge>
      </div>
      <div className="text-muted-foreground text-sm">
        {order.fulfillment_method === 'delivery' ? <p>Delivery to: {order.delivery_address}</p> : <p>Pickup at store</p>}
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
              <TableCell className="tabular-nums">Rs. {item.price.toFixed(2)}</TableCell>
              <TableCell className="tabular-nums">{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {order.discount_amount > 0 && (
        <p className="text-success text-sm tabular-nums">Coupon {order.coupon_code}: -Rs. {order.discount_amount.toFixed(2)}</p>
      )}
      {order.delivery_fee > 0 && <p className="text-muted-foreground text-sm tabular-nums">Delivery fee: Rs. {order.delivery_fee.toFixed(2)}</p>}
      <p className="font-medium tabular-nums">Total: Rs. {order.total.toFixed(2)}</p>
    </div>
  );
}
