import { useState } from 'react';
import { toast } from 'sonner';
import { Banknote, CheckCircle2, HandCoins, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format_price } from '@/lib/format-price';
import { ApiError } from '@/shared/api/api-error';
import type { OrderSettlementInfo } from '../types/delivery-types';

interface OrderSettlementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  settlement: OrderSettlementInfo;
  partnerName?: string | null;
  storeName?: string | null;
  role: 'store' | 'rider';
  onSettle: (payload: { method: 'cash' | 'upi'; note?: string }) => Promise<unknown>;
}

export function OrderSettlementModal({
  open,
  onOpenChange,
  orderId,
  settlement,
  partnerName,
  storeName,
  role,
  onSettle
}: OrderSettlementModalProps) {
  const [method, setMethod] = useState<'cash' | 'upi'>('cash');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStore = role === 'store';

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onSettle({ method, note: note.trim() || undefined });
      toast.success(isStore ? 'Order payment settled with delivery partner!' : 'Payment to store recorded successfully!');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not complete settlement');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sky-600 mb-1">
            <HandCoins className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isStore ? 'Store & Partner Settlement' : 'Remit Cash to Store'}
            </span>
          </div>
          <DialogTitle className="text-lg">
            {isStore ? `Settle Order #${orderId.slice(0, 8)}` : `Pay Store for #${orderId.slice(0, 8)}`}
          </DialogTitle>
          <DialogDescription>
            {isStore
              ? `Confirm cash collection and rider ride payment with ${partnerName || 'delivery partner'}.`
              : `Hand over collected customer cash to ${storeName || 'the store'}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Financial Breakdown Card */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-xs text-slate-700 flex flex-col gap-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Customer cash collected:</span>
              <strong className="text-slate-900 font-semibold tabular-nums text-sm">
                {format_price(settlement.cash_collected)}
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Store products amount:</span>
              <strong className="text-slate-900 font-semibold tabular-nums">
                {format_price(settlement.store_amount)}
              </strong>
            </div>
            <div className="flex justify-between items-center text-emerald-700">
              <span>Delivery partner ride earning:</span>
              <strong className="font-semibold tabular-nums">
                +{format_price(settlement.rider_earning)}
              </strong>
            </div>
            <div className="mt-1 border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold text-sky-900">
              <span>{isStore ? 'Net cash to receive from partner:' : 'Net cash to pay to store:'}</span>
              <span className="text-base font-extrabold text-sky-700 tabular-nums">
                {format_price(settlement.net_to_store)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic mt-0.5">
              Net settlement: Partner pays {format_price(settlement.store_amount)} to the store and retains {format_price(settlement.rider_earning)} as ride fee.
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-slate-800">Payment method</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  method === 'cash'
                    ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Banknote className="size-4 text-emerald-600" />
                <span>Cash handover</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  method === 'upi'
                    ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <QrCode className="size-4 text-sky-600" />
                <span>UPI / QR transfer</span>
              </button>
            </div>
          </div>

          {/* Note Input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settle-note" className="text-xs font-semibold text-slate-800">
              Reference / Note <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="settle-note"
              placeholder={isStore ? 'e.g. Received at cashier counter' : 'e.g. Handed to cashier'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-sky-600 hover:bg-sky-700 text-white gap-1.5 cursor-pointer font-semibold"
          >
            <CheckCircle2 className="size-4" />
            {isSubmitting ? 'Settling…' : isStore ? 'Confirm Settlement' : 'Mark Cash Paid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
