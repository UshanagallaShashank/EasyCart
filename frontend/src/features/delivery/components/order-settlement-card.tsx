// Settlement for one delivered order, shown on the store's and the rider's order pages.
import { useState } from 'react';
import { format_price } from '@/lib/format-price';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '../lib/delivery-labels';
import type { SettleSide } from '../hooks/use-settle';
import type { OrderSettlementInfo } from '../types/delivery-types';
import { ToneBadge } from './tone-badge';
import { SettleDialog } from './settlement/settle-dialog';
import { SETTLE_COPY } from './settlement/settle-copy';

export function OrderSettlementCard({ side, settlement, counterpart }: { side: SettleSide; settlement?: OrderSettlementInfo | null; counterpart?: string | null }) {
  const [open, setOpen] = useState(false);
  if (!settlement || !settlement.is_cod) return null;
  const copy = SETTLE_COPY[side];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Cash settlement</p>
        <ToneBadge tone={settlement.is_settled ? 'success' : 'warning'} label={settlement.is_settled ? 'Settled' : 'Not settled'} />
      </div>
      <div className="flex flex-col gap-1 text-sm tabular-nums">
        <div className="flex justify-between text-slate-600"><span>Cash from customer</span><span>{format_price(settlement.cash_collected)}</span></div>
        <div className="flex justify-between text-slate-600"><span>Rider keeps (delivery fee)</span><span>{format_price(settlement.rider_earning)}</span></div>
        <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900"><span>{copy.owe}</span><span>{format_price(settlement.net_to_store)}</span></div>
      </div>
      {settlement.is_settled ? (
        <p className="text-xs text-slate-500">Settled {formatDateTime(settlement.settled_at)} by {settlement.settled_by === 'rider' ? 'the rider' : 'the store'} ({settlement.method ?? 'cash'}){settlement.note && ` · ${settlement.note}`}</p>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)} className="self-start">{copy.action}</Button>
      )}
      <SettleDialog side={side} settlement={open ? settlement : null} counterpart={counterpart} onClose={() => setOpen(false)} />
    </div>
  );
}
