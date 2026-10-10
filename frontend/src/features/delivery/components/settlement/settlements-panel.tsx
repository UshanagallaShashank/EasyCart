// Delivered cash orders and whether each one is settled between rider and store.
// The store sees cash to receive from riders; the rider sees cash to hand to stores. Same list, different wording.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterPills } from '@/components/filter-pills';
import { format_price } from '@/lib/format-price';
import { formatDateTime } from '../../lib/delivery-labels';
import type { SettleSide } from '../../hooks/use-settle';
import type { OrderSettlementInfo, SettlementRow } from '../../types/delivery-types';
import { ToneBadge } from '../tone-badge';
import { SettleDialog } from './settle-dialog';
import { SETTLE_COPY } from './settle-copy';

type View = 'open' | 'settled';

interface SettlementsPanelProps {
  side: SettleSide;
  rows: SettlementRow[] | undefined;
  isLoading: boolean;
}

export function SettlementsPanel({ side, rows = [], isLoading }: SettlementsPanelProps) {
  const [view, setView] = useState<View>('open');
  const [active, setActive] = useState<{ settlement: OrderSettlementInfo; counterpart: string | null } | null>(null);
  const copy = SETTLE_COPY[side];
  const open = rows.filter((row) => !row.is_settled && row.net_to_store > 0);
  const settled = rows.filter((row) => row.is_settled);
  const visible = view === 'open' ? open : settled;
  const sum = (list: SettlementRow[]) => list.reduce((total, row) => total + row.net_to_store, 0);
  const orderLink = (id: string) => (side === 'store' ? `/dashboard/orders/${id}` : `/rider/orders/${id}`);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><HandCoins className="size-4 text-sky-600" /> {side === 'store' ? 'Cash from riders' : 'Cash to hand to stores'}</h2>
          <p className="text-xs text-slate-500">For cash orders, the rider gives the store the order total minus their delivery fee.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{copy.owe}</p>
          <p className="text-lg font-bold text-amber-700 tabular-nums">{format_price(sum(open))}</p>
        </div>
      </div>

      <FilterPills<View> options={[{ value: 'open', label: 'Not settled', count: open.length }, { value: 'settled', label: 'Settled', count: settled.length }]} value={view} onChange={setView} />

      {isLoading ? <Skeleton className="h-32 w-full rounded-xl" /> : visible.length === 0 ? (
        <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-xs text-slate-500">
          {view === 'open' ? <><CheckCircle2 className="size-4 text-emerald-500" /> All settled. Nothing to collect.</> : 'Nothing settled yet.'}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80">
          {visible.map((row) => {
            const counterpart = side === 'store' ? row.rider_name ?? null : row.store_name ?? null;
            return (
              <li key={row.order_id} className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={orderLink(row.order_id)} className="font-mono text-xs font-bold text-sky-700 hover:underline">#{row.order_id.slice(0, 8)}</Link>
                    <span className="truncate text-sm font-medium text-slate-900">{counterpart ?? copy.counterpartFallback}</span>
                    {row.is_settled && <ToneBadge tone="success" label={`Settled · ${row.method ?? 'cash'}`} />}
                  </div>
                  <p className="text-xs text-slate-500">
                    Delivered {formatDateTime(row.delivered_at ?? row.created_at)} · cash {format_price(row.cash_collected)} · fee {format_price(row.rider_earning)}
                    {row.is_settled && row.settled_at && ` · settled ${formatDateTime(row.settled_at)}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{format_price(row.net_to_store)}</span>
                  {!row.is_settled && side === 'store' && <Button size="sm" onClick={() => setActive({ settlement: row, counterpart })}>{copy.action}</Button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <SettleDialog side={side} settlement={active?.settlement ?? null} counterpart={active?.counterpart} onClose={() => setActive(null)} />
    </section>
  );
}
