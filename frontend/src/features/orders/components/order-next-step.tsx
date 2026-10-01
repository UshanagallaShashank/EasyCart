// One-tap button that moves an order to its next status (pending → confirmed → fulfilled).
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/shared/api/api-error';
import { useUpdateOrderStatus } from '../hooks/use-update-order-status';
import type { Order } from '../types/order-types';

const NEXT_STEP: Partial<Record<Order['status'], { status: Order['status']; label: string }>> = {
  pending: { status: 'confirmed', label: 'Confirm order' },
  confirmed: { status: 'fulfilled', label: 'Mark as fulfilled' }
};

export function OrderNextStep({ order }: { order: Order }) {
  const update = useUpdateOrderStatus();
  const next = NEXT_STEP[order.status];
  if (!next) return null;

  function advance_order() {
    update.mutate({ id: order.id, status: next!.status }, {
      onSuccess: () => toast.success(`Order ${next!.status}`),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to update order')
    });
  }

  return (
    <Button size="lg" onClick={advance_order} disabled={update.isPending} className="h-10 gap-2 px-4">
      {next.status === 'fulfilled' ? <CheckCircle2 /> : <ArrowRight />} {update.isPending ? 'Updating…' : next.label}
    </Button>
  );
}
