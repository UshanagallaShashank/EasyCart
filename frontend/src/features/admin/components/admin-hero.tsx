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
    <section className="relative overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-r from-sky-100/90 via-sky-50 to-indigo-100/80 p-6 text-slate-900 shadow-xs md:p-8">
      <div className="absolute -top-20 -right-16 size-72 rounded-full bg-sky-300/30 blur-3xl pointer-events-none" />
      <div className="absolute right-28 -bottom-10 size-48 rounded-full bg-indigo-300/25 blur-2xl pointer-events-none" />
      <p className="relative text-xs font-bold uppercase tracking-wider text-sky-800/80">{today}</p>
      <h1 className="relative mt-1 font-heading text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
        Welcome back, <span className="text-sky-700">{user?.username}</span>
      </h1>
      <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
        {chips.map((c) => (
          <div key={c.label} className="rounded-2xl border border-sky-200/70 bg-white/80 p-4 shadow-xs backdrop-blur-sm">
            <p className="text-xs font-bold text-slate-500">{c.label}</p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <p className="truncate font-heading text-xl font-extrabold text-slate-900 tabular-nums">{c.value}</p>
              {c.trend && <TrendBadge trend={c.trend} onDark={false} />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
