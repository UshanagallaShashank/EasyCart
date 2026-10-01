// One day's revenue column in the sales chart, with a tooltip on hover, focus, or tap.
import { format_price } from '@/lib/format-price';
import type { DailyRevenue } from '../lib/get-daily-revenue';

export function SalesChartBar({ day, max, isToday }: { day: DailyRevenue; max: number; isToday: boolean }) {
  const height = day.total > 0 ? Math.max((day.total / max) * 100, 2) : 0;
  const summary = `${day.fullLabel}: ${format_price(day.total)}, ${day.orders} ${day.orders === 1 ? 'order' : 'orders'}`;

  return (
    <div className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none" tabIndex={0} aria-label={summary}>
      <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden -translate-y-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus:block">
        <p className="font-semibold tabular-nums">{format_price(day.total)}</p>
        <p className="text-slate-300">{day.orders} {day.orders === 1 ? 'order' : 'orders'} · {day.fullLabel}</p>
      </div>
      <div className="flex h-full w-full items-end justify-center rounded-md transition-colors group-hover:bg-slate-100/80 group-focus:bg-slate-100/80">
        <div className="w-full max-w-6 rounded-t-[4px] bg-[#0284C7] transition-[height] duration-700" style={{ height: `${height}%`, opacity: isToday ? 1 : 0.85 }} />
      </div>
    </div>
  );
}
