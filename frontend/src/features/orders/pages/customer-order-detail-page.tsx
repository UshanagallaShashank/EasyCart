import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getOrderStatusTone, getPaymentStatusTone, getFulfillmentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useMyOrder } from '../hooks/use-my-order';
import { canCustomerCancel, formatMoney, formatOrderDate, shortOrderId } from '../lib/order-rules';
import { CustomerPageShell } from '../components/customer-page-shell';
import { OrderProgress } from '../components/order-progress';
import { CancelOrderDialog } from '../components/cancel-order-dialog';

export function CustomerOrderDetailPage() {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const { data: order, isLoading, isError } = useMyOrder(id!);
  const [cancelOpen, setCancelOpen] = useState(false);
  const lastSlug = slug || sessionStorage.getItem('last_store_slug');
  const backPath = lastSlug ? `/${lastSlug}/orders` : '/customer/orders';

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
          <Card>
            <CardContent className="pt-6">
              <OrderProgress status={order.status} />
            </CardContent>
          </Card>

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
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge>
              <Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge>
              <Badge className={STATUS_TONE_CLASSNAME[getFulfillmentStatusTone(order.fulfillment_status)]}>
                {order.fulfillment_status.replaceAll('_', ' ')}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{order.fulfillment_method === 'delivery' ? 'Delivery' : 'Pickup'}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-2 text-sm text-slate-600">
              {order.fulfillment_method === 'delivery' ? (
                <>
                  <MapPin className="mt-0.5 size-4 shrink-0 text-sky-500" />
                  <p>{order.delivery_address}</p>
                </>
              ) : (
                <>
                  <Store className="mt-0.5 size-4 shrink-0 text-sky-500" />
                  <p>Pick up at the store</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm tabular-nums">
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
              {(order.discount_amount > 0 || order.delivery_fee > 0) && <Separator />}
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
              <p className="text-xs text-slate-400">Payment: cash on delivery</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CancelOrderDialog order={order} open={cancelOpen} onOpenChange={setCancelOpen} />
    </CustomerPageShell>
  );
}
