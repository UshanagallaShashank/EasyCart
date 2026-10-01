// Overview header band: greeting, today's date, and this week's sales and orders with change vs last week.
import { useAuth } from '@/shared/auth/auth-context';
import { formatMoney } from '@/features/orders/lib/order-rules';
import { TrendBadge } from './trend-badge';
import type { Trend } from '../lib/get-week-trend';

export function AdminHero({ sales, orders, pending }: { sales?: Trend; orders?: Trend; pending?: number }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const chips = [
    { label: 'Sales this week', value: sales ? formatMoney(sales.current) : '…', trend: sales },
    { label: 'Orders this week', value: orders ? String(orders.current) : '…', trend: orders },
    { label: 'Pending orders', value: pending === undefined ? '…' : String(pending) }
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-700 to-slate-900 p-6 text-white shadow-lg shadow-sky-900/10 md:p-8">
      <div className="absolute -top-20 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
      <p className="relative text-sm text-sky-100">{today}</p>
      <h1 className="relative mt-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">Welcome back, {user?.username}</h1>
      <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
        {chips.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
            <p className="text-xs font-medium text-sky-100">{c.label}</p>
            <div className="mt-1 flex items-baseline justify-between gap-2"><p className="truncate font-heading text-xl font-bold tabular-nums">{c.value}</p>{c.trend && <TrendBadge trend={c.trend} onDark />}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
