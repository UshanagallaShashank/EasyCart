// One day's column in a DailyBarChart, with a tooltip on hover, focus, or tap.
import type { DayBucket } from '@/lib/bucket-by-day';

interface DailyBarChartBarProps {
  day: DayBucket;
  max: number;
  isToday: boolean;
  describe(day: DayBucket): { value: string; detail: string };
}

export function DailyBarChartBar({ day, max, isToday, describe }: DailyBarChartBarProps) {
  const height = day.value > 0 ? Math.max((day.value / max) * 100, 2) : 0;
  const { value, detail } = describe(day);

  return (
    <div className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end outline-none" tabIndex={0} aria-label={`${day.fullLabel}: ${value}, ${detail}`}>
      <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden -translate-y-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus:block">
        <p className="font-semibold tabular-nums">{value}</p>
        <p className="text-slate-300">{detail} · {day.fullLabel}</p>
      </div>
      <div className="flex h-full w-full items-end justify-center rounded-md transition-colors group-hover:bg-slate-100/80 group-focus:bg-slate-100/80">
        <div className="w-full max-w-6 rounded-t-[4px] bg-[#0284C7] transition-[height] duration-700" style={{ height: `${height}%`, opacity: isToday ? 1 : 0.85 }} />
      </div>
    </div>
  );
}
