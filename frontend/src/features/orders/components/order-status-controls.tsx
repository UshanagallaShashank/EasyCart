import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUpdateOrderStatus } from '../hooks/use-update-order-status';
import { useUpdatePaymentStatus } from '../hooks/use-update-payment-status';
import { ApiError } from '@/shared/api/api-error';
import type { Order } from '../types/order-types';

const STATUSES: Order['status'][] = ['pending', 'confirmed', 'fulfilled', 'cancelled'];
const PAYMENT_STATUSES: Order['payment_status'][] = ['unpaid', 'paid'];

export function OrderStatusControls({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();

  function onError(err: unknown) {
    toast.error(err instanceof ApiError ? err.message : 'Failed to update order');
  }

  return (
    <div className="flex gap-6">
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
    </div>
  );
}
