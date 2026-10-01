import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Store as StoreIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { getOrderStatusTone, getPaymentStatusTone, getFulfillmentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useOrder } from '../hooks/use-order';
import { OrderStatusControls } from '../components/order-status-controls';
import { OrderProgress } from '../components/order-progress';
import { formatMoney, formatOrderDate } from '../lib/order-rules';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
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
            {`Order #${order.id.slice(0, 8)}`}
          </span>
        }
        description="Review items, update status, and manage fulfillment."
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <OrderProgress status={order.status} />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Update order</h2>
              <OrderStatusControls order={order} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, i) => (
                    <TableRow key={i} className="hover:bg-sky-50/40">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.variant_label ?? '—'}</TableCell>
                      <TableCell className="tabular-nums">{formatMoney(item.price)}</TableCell>
                      <TableCell className="tabular-nums">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Status</h2>
              <div className="flex flex-wrap gap-2">
                <Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge>
                <Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge>
                <Badge className={STATUS_TONE_CLASSNAME[getFulfillmentStatusTone(order.fulfillment_status)]}>
                  {order.fulfillment_status.replaceAll('_', ' ')}
                </Badge>
              </div>
              <p className="mt-3 text-xs text-slate-400">Placed {formatOrderDate(order.created_at)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                {order.fulfillment_method === 'delivery' ? 'Delivery' : 'Pickup'}
              </h2>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                {order.fulfillment_method === 'delivery' ? (
                  <>
                    <MapPin className="mt-0.5 size-4 shrink-0 text-sky-500" />
                    <span>{order.delivery_address}</span>
                  </>
                ) : (
                  <>
                    <StoreIcon className="mt-0.5 size-4 shrink-0 text-sky-500" />
                    <span>Customer picks up at the store</span>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Summary</h2>
              <div className="flex flex-col gap-2 text-sm tabular-nums">
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon {order.coupon_code}</span>
                    <span>-{formatMoney(order.discount_amount)}</span>
                  </div>
                )}
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery fee</span>
                    <span>{formatMoney(order.delivery_fee)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatMoney(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
