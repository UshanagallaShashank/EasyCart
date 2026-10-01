// Day-by-day sales and orders for the last 14 days, newest first, with average order value.
import { formatMoney } from '@/features/orders/lib/order-rules';
import type { PlatformStats } from '../types/admin-types';

export function DailySalesTable({ series }: { series: PlatformStats['daily_revenue'] }) {
  const rows = series.slice(-14).reverse();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <h2 className="px-5 pt-5 pb-3 text-sm font-semibold text-slate-900">Daily breakdown, last 14 days</h2>
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
