import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getOrderStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useMyOrder } from '../hooks/use-my-order';
import { canCustomerCancel, formatMoney, formatOrderDate, shortOrderId } from '../lib/order-rules';
import { customerOrdersPath, getLastStoreSlug } from '@/features/storefront/lib/customer-paths';
import { CustomerPageShell } from '../components/customer-page-shell';
import { OrderProgress } from '../components/order-progress';
import { CancelOrderDialog } from '../components/cancel-order-dialog';
import { CustomerDeliveryCard } from '@/features/delivery/components/customer-delivery-card';

// Plain words for the customer instead of internal status names.
const ORDER_STATUS_LABEL: Record<'pending' | 'confirmed' | 'fulfilled' | 'cancelled', string> = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  fulfilled: 'Completed',
  cancelled: 'Cancelled'
};

export function CustomerOrderDetailPage() {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const { data: order, isLoading, isError } = useMyOrder(id!);
  const [cancelOpen, setCancelOpen] = useState(false);
  const shopSlug = slug || getLastStoreSlug();
  const backPath = shopSlug ? customerOrdersPath(shopSlug) : '/';

  const backLink = (
    <Link to={backPath} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
      <ArrowLeft className="size-3.5" /> Back to orders
    </Link>
  );

  if (isLoading) {
    return (
      <CustomerPageShell title="Order" eyebrow={backLink}>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </CustomerPageShell>
    );
  }

  if (isError || !order) {
    return (
      <CustomerPageShell title="Order not found" eyebrow={backLink}>
        <p className="text-muted-foreground">We could not find this order.</p>
      </CustomerPageShell>
    );
  }

  const isLiveDelivery = order.fulfillment_method === 'delivery' && order.status !== 'cancelled';

  const cancelButton = canCustomerCancel(order) && (
    <Button variant="destructive" onClick={() => setCancelOpen(true)}>
      <XCircle /> Cancel order
    </Button>
  );

  return (
    <CustomerPageShell
      title={`Order ${shortOrderId(order.id)}`}
      description={`Placed on ${formatOrderDate(order.created_at)}`}
      eyebrow={backLink}
      actions={cancelButton}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
          {/* A live delivery comes first: it holds the code the customer gives the rider. */}
          {isLiveDelivery ? (
            <CustomerDeliveryCard orderId={order.id} address={order.delivery_address} />
          ) : (
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6">
                <OrderProgress status={order.status} />
                <div className="flex items-start gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  {order.fulfillment_method === 'delivery' ? <MapPin className="mt-0.5 size-4 shrink-0 text-sky-500" /> : <Store className="mt-0.5 size-4 shrink-0 text-sky-500" />}
                  <p className="min-w-0 break-words">{order.fulfillment_method === 'delivery' ? order.delivery_address : 'Pick up at the store'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.variant_label ? `${item.variant_label} · ` : ''}
                      {formatMoney(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 whitespace-nowrap font-medium tabular-nums">{formatMoney(item.price * item.quantity)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Summary</CardTitle>
              <Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm tabular-nums">
              <div className="flex justify-between text-slate-600">
                <span>Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>{formatMoney(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
              </div>
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
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
              <p className="text-xs text-slate-500">Cash on delivery · {order.payment_status === 'paid' ? 'Paid' : order.status === 'cancelled' ? 'Nothing to pay' : 'Pay when you receive it'}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CancelOrderDialog order={order} open={cancelOpen} onOpenChange={setCancelOpen} />
    </CustomerPageShell>
  );
}
