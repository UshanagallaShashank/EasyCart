// Confirms one settlement: how the money changed hands (cash or UPI) and an optional reference.
import { useState } from 'react';
import { toast } from 'sonner';
import { Banknote, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format_price } from '@/lib/format-price';
import { ApiError } from '@/shared/api/api-error';
import { useSettle, type SettleSide } from '../../hooks/use-settle';
import type { OrderSettlementInfo } from '../../types/delivery-types';
import { SETTLE_COPY } from './settle-copy';

interface SettleDialogProps {
  side: SettleSide;
  settlement: OrderSettlementInfo | null;
  counterpart?: string | null;
  onClose(): void;
}

const METHODS = [{ value: 'cash', label: 'Cash', icon: Banknote }, { value: 'upi', label: 'UPI', icon: QrCode }] as const;

export function SettleDialog({ side, settlement, counterpart, onClose }: SettleDialogProps) {
  const [method, setMethod] = useState<'cash' | 'upi'>('cash');
  const [note, setNote] = useState('');
  const settle = useSettle(side);
  const copy = SETTLE_COPY[side];

  function handleConfirm() {
    if (!settlement) return;
    settle.mutate({ orderId: settlement.order_id, method, note: note.trim() || undefined }, {
      onSuccess: () => { toast.success(copy.done); onClose(); },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not settle this order')
    });
  }

  return (
    <Dialog open={Boolean(settlement)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{copy.action} · #{settlement?.order_id.slice(0, 8)}</DialogTitle>
          <DialogDescription>
            {settlement && <>{format_price(settlement.net_to_store)} {side === 'store' ? 'from' : 'to'} {counterpart || copy.counterpartFallback}. The rider keeps the {format_price(settlement.rider_earning)} delivery fee.</>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map(({ value, label, icon: Icon }) => (
            <button key={value} type="button" onClick={() => setMethod(value)} aria-pressed={method === value}
              className={cn('flex items-center justify-center gap-2 rounded-xl border p-2.5 text-sm font-semibold transition-colors', method === value ? 'border-sky-500 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reference, e.g. UPI ref (optional)" maxLength={200} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={settle.isPending}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={settle.isPending}>{settle.isPending ? 'Saving…' : copy.action}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
