import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateOrderStatus } from '../hooks/use-update-order-status';
import { useUpdatePaymentStatus } from '../hooks/use-update-payment-status';
import { useUpdateFulfillmentStatus } from '../hooks/use-update-fulfillment-status';
import { useUpdateAssignment } from '../hooks/use-update-assignment';
import { ApiError } from '@/shared/api/api-error';
import { format_status_label } from '@/lib/format-status-label';
import type { Order, PickupFulfillmentStatus, DeliveryFulfillmentStatus } from '../types/order-types';

const STATUSES: Order['status'][] = ['pending', 'confirmed', 'fulfilled', 'cancelled'];
const PAYMENT_STATUSES: Order['payment_status'][] = ['unpaid', 'paid'];
const PICKUP_FULFILLMENT_STATUSES: PickupFulfillmentStatus[] = ['not_started', 'ready_for_pickup', 'picked_up'];
const DELIVERY_FULFILLMENT_STATUSES: DeliveryFulfillmentStatus[] = ['not_started', 'dispatched', 'delivered'];

export function OrderStatusControls({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillment_status);
  const [assignedTo, setAssignedTo] = useState(order.assigned_to ?? '');

  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();
  const updateFulfillmentStatus = useUpdateFulfillmentStatus();
  const updateAssignment = useUpdateAssignment();

  useEffect(() => {
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
    setFulfillmentStatus(order.fulfillment_status);
    setAssignedTo(order.assigned_to ?? '');
  }, [order.status, order.payment_status, order.fulfillment_status, order.assigned_to]);

  const fulfillmentStatuses = order.fulfillment_method === 'delivery' ? DELIVERY_FULFILLMENT_STATUSES : PICKUP_FULFILLMENT_STATUSES;

  const trimmedAssignedTo = assignedTo.trim();
  const isDirty =
    status !== order.status ||
    paymentStatus !== order.payment_status ||
    fulfillmentStatus !== order.fulfillment_status ||
    trimmedAssignedTo !== (order.assigned_to ?? '');

  const isSaving = updateStatus.isPending || updatePayment.isPending || updateFulfillmentStatus.isPending || updateAssignment.isPending;

  async function handleSave() {
    const tasks: Promise<unknown>[] = [];
    if (status !== order.status) {
      tasks.push(updateStatus.mutateAsync({ id: order.id, status }));
    }
    if (paymentStatus !== order.payment_status) {
      tasks.push(updatePayment.mutateAsync({ id: order.id, payment_status: paymentStatus }));
    }
    if (fulfillmentStatus !== order.fulfillment_status) {
      tasks.push(updateFulfillmentStatus.mutateAsync({ id: order.id, fulfillment_status: fulfillmentStatus }));
    }
    if (trimmedAssignedTo !== (order.assigned_to ?? '')) {
      tasks.push(updateAssignment.mutateAsync({ id: order.id, assigned_to: trimmedAssignedTo || null }));
    }

    try {
      await Promise.all(tasks);
      toast.success('Order updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update order');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:flex xl:flex-wrap xl:gap-6">
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Order['status'])}>
            <SelectTrigger className="w-full xl:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{format_status_label(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Payment</Label>
          <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as Order['payment_status'])}>
            <SelectTrigger className="w-full xl:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{format_status_label(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{order.fulfillment_method === 'delivery' ? 'Delivery status' : 'Pickup status'}</Label>
          <Select value={fulfillmentStatus} onValueChange={(v) => setFulfillmentStatus(v as Order['fulfillment_status'])}>
            <SelectTrigger className="w-full xl:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {fulfillmentStatuses.map((s) => <SelectItem key={s} value={s}>{format_status_label(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="assigned_to">Assigned to</Label>
          <Input
            id="assigned_to"
            className="w-full xl:w-40"
            placeholder="Unassigned"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
        </div>
        <Button className="w-full sm:col-span-2 xl:w-auto" onClick={handleSave} disabled={!isDirty || isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
