// Cash the rider handed in and payouts made to them, newest first.
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format_price } from '@/lib/format-price';
import { formatDateTime } from '../lib/delivery-labels';
import type { Settlement } from '../types/delivery-types';

export function SettlementList({ settlements }: { settlements: Settlement[] }) {
  if (settlements.length === 0) return <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">No cash deposits or payouts recorded yet.</p>;
  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {settlements.map((row) => {
        const deposit = row.kind === 'cash_deposit';
        return (
          <li key={row.id} className="flex items-center gap-3 py-3">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${deposit ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{deposit ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{deposit ? 'Cash handed in' : 'Payout received'}</p>
              <p className="truncate text-xs text-slate-500">{formatDateTime(row.created_at)}{row.note && ` · ${row.note}`}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums">{format_price(row.amount)}</span>
          </li>
        );
      })}
    </ul>
  );
}
