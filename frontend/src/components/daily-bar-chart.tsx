// Single-series per-day column chart: headline, clean y-axis ticks, hover tooltips, and a screen-reader table.
import type { DayBucket } from '@/lib/bucket-by-day';
import { get_nice_max } from '@/lib/get-nice-max';
import { DailyBarChartBar } from './daily-bar-chart-bar';

const TICK_FORMAT = new Intl.NumberFormat('en', { notation: 'compact' });

interface DailyBarChartProps {
  title: string;
  headline: string;
  days: DayBucket[];
  describe(day: DayBucket): { value: string; detail: string };
}

export function DailyBarChart({ title, headline, days, describe }: DailyBarChartProps) {
  const peak = Math.max(...days.map((d) => d.value));
  const max = peak > 0 ? get_nice_max(peak) : 1;
  const ticks = Number.isInteger(max / 2) ? [max, max / 2, 0] : [max, 0];

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 font-heading text-2xl font-bold text-slate-900 tabular-nums">{headline}</p>
      <div className="mt-5 flex h-48 gap-3">
        <div className="flex flex-col justify-between pb-6 text-right text-[11px] text-slate-400 tabular-nums" aria-hidden>
          {ticks.map((t) => <span key={t} className="-translate-y-1/2 leading-none">{TICK_FORMAT.format(t)}</span>)}
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden>
            {ticks.map((t) => <div key={t} className="h-px bg-slate-100" />)}
          </div>
          <div className="relative flex flex-1 gap-0.5 sm:gap-2">
            {days.map((d, i) => <DailyBarChartBar key={d.key} day={d} max={max} isToday={i === days.length - 1} describe={describe} />)}
          </div>
          <div className="flex h-6 gap-0.5 pt-1.5 sm:gap-2" aria-hidden>
            {days.map((d) => <span key={d.key} className="flex min-w-0 flex-1 justify-center text-[11px] whitespace-nowrap text-slate-500">{d.label}</span>)}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>{days.map((d) => { const { value, detail } = describe(d); return <tr key={d.key}><th scope="row">{d.fullLabel}</th><td>{value}</td><td>{detail}</td></tr>; })}</tbody>
      </table>
    </section>
  );
}
