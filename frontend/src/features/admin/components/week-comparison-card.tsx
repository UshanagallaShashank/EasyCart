// This week vs last week for sales and orders, side by side with the change.
import { formatMoney } from '@/features/orders/lib/order-rules';
import { TrendBadge } from './trend-badge';
import type { Trend } from '../lib/get-week-trend';

export function WeekComparisonCard({ sales, orders }: { sales: Trend; orders: Trend }) {
  const rows = [
    { label: 'Sales', now: formatMoney(sales.current), before: formatMoney(sales.previous), trend: sales },
    { label: 'Orders', now: String(orders.current), before: String(orders.previous), trend: orders }
  ];

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">This week vs last week</h2>
      <table className="mt-3 w-full text-sm">
        <thead><tr className="text-left text-xs text-slate-500"><th className="py-2 font-medium" /><th className="py-2 font-medium">Last 7 days</th><th className="py-2 font-medium">7 days before</th><th className="py-2 text-right font-medium">Change</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => <tr key={r.label}><th scope="row" className="py-3 text-left font-medium text-slate-700">{r.label}</th><td className="py-3 font-semibold text-slate-900 tabular-nums">{r.now}</td><td className="py-3 text-slate-500 tabular-nums">{r.before}</td><td className="py-3 text-right"><TrendBadge trend={r.trend} /></td></tr>)}
        </tbody>
      </table>
    </section>
  );
}
