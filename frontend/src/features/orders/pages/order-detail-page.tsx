import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Store as StoreIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { getOrderStatusTone, getPaymentStatusTone, getFulfillmentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useOrder } from '../hooks/use-order';
import { OrderStatusControls } from '../components/order-status-controls';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <p className="text-slate-500">Order not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <Link
              to="/dashboard/orders"
              aria-label="Back to orders"
              className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="size-6" />
            </Link>
            {`Order ${order.id.slice(0, 8)}`}
          </span>
        }
        description="Review items, update status, and manage fulfillment."
      />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge>
              <Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge>
              <Badge className={STATUS_TONE_CLASSNAME[getFulfillmentStatusTone(order.fulfillment_status)]}>
                {order.fulfillment_status.replaceAll('_', ' ')}
              </Badge>
            </div>
            <OrderStatusControls order={order} />
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              {order.fulfillment_method === 'delivery' ? (
                <>
                  <MapPin className="size-4 shrink-0" />
                  <span>Delivery to: {order.delivery_address}</span>
                </>
              ) : (
                <>
                  <StoreIcon className="size-4 shrink-0" />
                  <span>Pickup at store</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
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
            <div className="flex flex-col items-end gap-1 pt-4 mt-2 border-t border-slate-100">
              {order.discount_amount > 0 && (
                <p className="text-success text-sm tabular-nums">Coupon {order.coupon_code}: -Rs. {order.discount_amount.toFixed(2)}</p>
              )}
              {order.delivery_fee > 0 && (
                <p className="text-muted-foreground text-sm tabular-nums">Delivery fee: Rs. {order.delivery_fee.toFixed(2)}</p>
              )}
              <p className="font-semibold text-slate-900 tabular-nums">Total: Rs. {order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
