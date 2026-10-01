// Day-by-day sales and orders for a number of days the admin types in, newest first, with average order value.
import { useState } from 'react';
import { formatMoney } from '@/features/orders/lib/order-rules';
import type { PlatformStats } from '../types/admin-types';

// The backend sends 30 days, so 30 is the most that can be shown.
const MAX_DAYS = 30;
const DEFAULT_DAYS = 7;

export function DailySalesTable({ series }: { series: PlatformStats['daily_revenue'] }) {
  // Keep what the admin typed as text, so the box can be empty while they type a new number.
  const [typedDays, setTypedDays] = useState(String(DEFAULT_DAYS));
  const typedNumber = Number(typedDays);
  const daysShown = typedNumber >= 1 ? Math.min(Math.floor(typedNumber), MAX_DAYS) : DEFAULT_DAYS;
  const rows = series.slice(-daysShown).reverse();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">Daily breakdown, last {daysShown} days</h2>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          Show last
          <input
            type="number"
            min={1}
            max={MAX_DAYS}
            value={typedDays}
            onChange={(e) => setTypedDays(e.target.value)}
            onBlur={() => setTypedDays(String(daysShown))}
            className="h-8 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm tabular-nums text-slate-900 outline-none focus:border-sky-400"
          />
          days (max {MAX_DAYS})
        </label>
      </div>
      <div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50/70 text-left text-xs text-slate-500"><tr><th className="py-2.5 pr-2 pl-4 font-medium sm:px-5">Day (UTC)</th><th className="py-2.5 text-right font-medium">Orders</th><th className="py-2.5 pr-4 text-right font-medium sm:pr-0">Sales</th><th className="hidden px-5 py-2.5 text-right font-medium sm:table-cell">Avg. order</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((d) => (
              <tr key={d.date}>
                <td className="py-2.5 pr-2 pl-4 text-slate-700 sm:px-5">{new Date(`${d.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}</td>
                <td className="py-2.5 text-right tabular-nums">{d.orders}</td>
                <td className="py-2.5 pr-4 text-right font-medium tabular-nums sm:pr-0">{formatMoney(d.revenue)}</td>
                <td className="hidden px-5 py-2.5 text-right text-slate-500 tabular-nums sm:table-cell">{d.orders ? formatMoney(d.revenue / d.orders) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
