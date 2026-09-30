import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUpdateOrderStatus } from '../hooks/use-update-order-status';
import { useUpdatePaymentStatus } from '../hooks/use-update-payment-status';
import { useUpdateFulfillmentStatus } from '../hooks/use-update-fulfillment-status';
import { ApiError } from '@/shared/api/api-error';
import type { Order, PickupFulfillmentStatus, DeliveryFulfillmentStatus } from '../types/order-types';

const STATUSES: Order['status'][] = ['pending', 'confirmed', 'fulfilled', 'cancelled'];
const PAYMENT_STATUSES: Order['payment_status'][] = ['unpaid', 'paid'];
const PICKUP_FULFILLMENT_STATUSES: PickupFulfillmentStatus[] = ['not_started', 'ready_for_pickup', 'picked_up'];
const DELIVERY_FULFILLMENT_STATUSES: DeliveryFulfillmentStatus[] = ['not_started', 'dispatched', 'delivered'];

export function OrderStatusControls({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();
  const updateFulfillmentStatus = useUpdateFulfillmentStatus();

  function onError(err: unknown) {
    toast.error(err instanceof ApiError ? err.message : 'Failed to update order');
  }

  const fulfillmentStatuses = order.fulfillment_method === 'delivery' ? DELIVERY_FULFILLMENT_STATUSES : PICKUP_FULFILLMENT_STATUSES;

  return (
    <div className="flex flex-wrap gap-6">
      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <Select value={order.status} onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v as Order['status'] }, { onError })}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Payment</Label>
        <Select value={order.payment_status} onValueChange={(v) => updatePayment.mutate({ id: order.id, payment_status: v as Order['payment_status'] }, { onError })}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>{order.fulfillment_method === 'delivery' ? 'Delivery status' : 'Pickup status'}</Label>
        <Select
          value={order.fulfillment_status}
          onValueChange={(v) => updateFulfillmentStatus.mutate({ id: order.id, fulfillment_status: v as Order['fulfillment_status'] }, { onError })}
        >
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {fulfillmentStatuses.map((s) => <SelectItem key={s} value={s}>{s.replaceAll('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
