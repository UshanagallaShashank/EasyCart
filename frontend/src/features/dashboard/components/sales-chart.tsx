// Seven-day revenue column chart with a headline total, clean y-axis ticks, and a screen-reader table.
import { Skeleton } from '@/components/ui/skeleton';
import { format_price } from '@/lib/format-price';
import { SalesChartBar } from './sales-chart-bar';
import { get_daily_revenue } from '../lib/get-daily-revenue';
import { get_nice_max } from '../lib/get-nice-max';
import type { Order } from '@/features/orders/types/order-types';

const TICK_FORMAT = new Intl.NumberFormat('en', { notation: 'compact' });

export function SalesChart({ orders }: { orders: Order[] | undefined }) {
  if (!orders) return <Skeleton className="h-[300px] w-full rounded-2xl" />;
  const days = get_daily_revenue(orders);
  const total = days.reduce((sum, d) => sum + d.total, 0);
  const max = get_nice_max(Math.max(...days.map((d) => d.total)));

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">Sales, last 7 days</h2>
      <p className="mt-1 font-heading text-2xl font-bold text-slate-900 tabular-nums">{format_price(total)}</p>
      <div className="mt-5 flex h-48 gap-3">
        <div className="flex flex-col justify-between pb-6 text-right text-[11px] text-slate-400 tabular-nums" aria-hidden>
          {[max, max / 2, 0].map((t) => <span key={t} className="-translate-y-1/2 leading-none">{TICK_FORMAT.format(t)}</span>)}
        </div>
        <div className="relative flex flex-1 flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden>
            {[0, 1, 2].map((i) => <div key={i} className="h-px bg-slate-100" />)}
          </div>
          <div className="relative flex flex-1 gap-1 sm:gap-2">
            {days.map((d, i) => <SalesChartBar key={d.key} day={d} max={max} isToday={i === days.length - 1} />)}
          </div>
          <div className="flex h-6 gap-1 pt-1.5 sm:gap-2" aria-hidden>
            {days.map((d) => <span key={d.key} className="flex-1 truncate text-center text-[11px] text-slate-500">{d.label}</span>)}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>Daily revenue, last 7 days</caption>
        <tbody>{days.map((d) => <tr key={d.key}><th scope="row">{d.fullLabel}</th><td>{format_price(d.total)}</td><td>{d.orders} orders</td></tr>)}</tbody>
      </table>
    </section>
  );
}
