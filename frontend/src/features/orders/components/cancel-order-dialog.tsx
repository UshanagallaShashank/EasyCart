// Asks the customer to confirm before an order is cancelled.
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/shared/api/api-error';
import type { Order } from '../types/order-types';
import { useCancelMyOrder } from '../hooks/use-cancel-my-order';
import { shortOrderId } from '../lib/order-rules';

interface CancelOrderDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelOrderDialog({ order, open, onOpenChange }: CancelOrderDialogProps) {
  const cancelOrder = useCancelMyOrder();

  function handleConfirm() {
    cancelOrder.mutate(order.id, {
      onSuccess: () => {
        toast.success(`Order ${shortOrderId(order.id)} cancelled`);
        onOpenChange(false);
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not cancel the order')
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel order {shortOrderId(order.id)}?</DialogTitle>
          <DialogDescription>
            The store will be told the order is cancelled and the items go back into stock. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cancelOrder.isPending}>
            Keep order
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={cancelOrder.isPending}>
            {cancelOrder.isPending ? 'Cancelling…' : 'Yes, cancel order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
