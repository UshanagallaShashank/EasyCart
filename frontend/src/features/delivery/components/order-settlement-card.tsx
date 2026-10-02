import { useState } from 'react';
import { Banknote, CheckCircle2, Clock, HandCoins, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format_price } from '@/lib/format-price';
import { formatDateTime } from '../lib/delivery-labels';
import type { OrderSettlementInfo } from '../types/delivery-types';
import { OrderSettlementModal } from './order-settlement-modal';

interface OrderSettlementCardProps {
  orderId: string;
  settlement?: OrderSettlementInfo | null;
  partnerName?: string | null;
  storeName?: string | null;
  role: 'store' | 'rider';
  onSettle: (payload: { method: 'cash' | 'upi'; note?: string }) => Promise<unknown>;
}

export function OrderSettlementCard({
  orderId,
  settlement,
  partnerName,
  storeName,
  role,
  onSettle
}: OrderSettlementCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!settlement) return null;

  const isStore = role === 'store';
  const isSettled = settlement.is_settled;

  return (
    <>
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <HandCoins className="size-4 text-sky-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Payment & Cash Settlement
            </h3>
          </div>
          {isSettled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="size-3" />
              Settled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              <Clock className="size-3" />
              Pending Payment
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
          <div className="rounded-lg bg-slate-50 p-2.5">
            <span className="text-slate-500 block text-[11px]">Customer Cash</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {format_price(settlement.cash_collected)}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5">
            <span className="text-slate-500 block text-[11px]">Store Amount</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {format_price(settlement.store_amount)}
            </span>
          </div>
          <div className="rounded-lg bg-emerald-50/70 p-2.5">
            <span className="text-emerald-700 block text-[11px]">
              {isSettled ? 'Rider Fee (Paid)' : 'Rider Fee (Due)'}
            </span>
            <span className="font-bold text-emerald-800 tabular-nums">
              +{format_price(settlement.rider_earning)}
            </span>
          </div>
          <div className="rounded-lg bg-sky-50/80 p-2.5">
            <span className="text-sky-700 block text-[11px]">
              {isSettled
                ? isStore
                  ? 'Cash Received'
                  : 'Remitted to Store'
                : isStore
                ? 'To Receive'
                : 'To Pay Store'}
            </span>
            <span className="font-extrabold text-sky-900 tabular-nums">
              {format_price(settlement.net_to_store)}
            </span>
          </div>
        </div>

        {isSettled ? (
          <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 flex flex-col gap-1 border border-slate-100">
            <div className="flex items-center justify-between">
              <span>Settlement Method:</span>
              <strong className="text-slate-900 uppercase font-semibold">
                {settlement.method || 'Cash'}
              </strong>
            </div>
            {settlement.settled_at && (
              <div className="flex items-center justify-between">
                <span>Date:</span>
                <span>{formatDateTime(settlement.settled_at)}</span>
              </div>
            )}
            {settlement.note && (
              <p className="text-[11px] text-slate-500 italic mt-0.5 border-t border-slate-200/60 pt-1">
                {settlement.note}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <Info className="size-3.5 text-slate-400 shrink-0" />
              {isStore
                ? `Collect ${format_price(settlement.net_to_store)} net cash from ${partnerName || 'the delivery partner'}.`
                : `Hand over ${format_price(settlement.net_to_store)} net cash to ${storeName || 'the store'}.`}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white shrink-0 text-xs font-semibold gap-1.5 h-8 px-3 cursor-pointer"
            >
              <Banknote className="size-3.5" />
              {isStore ? 'Settle with Partner' : 'Mark Paid to Store'}
            </Button>
          </div>
        )}
      </div>

      <OrderSettlementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        orderId={orderId}
        settlement={settlement}
        partnerName={partnerName}
        storeName={storeName}
        role={role}
        onSettle={onSettle}
      />
    </>
  );
}
