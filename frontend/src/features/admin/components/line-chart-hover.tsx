// Invisible per-day hover columns over a line chart, each showing a tooltip with that day's numbers.
import type { CumulativePoint } from '../lib/get-cumulative-stores';

export function LineChartHover({ points }: { points: CumulativePoint[] }) {
  return (
    <div className="absolute inset-0 flex">
      {points.map((p) => (
        <div key={p.key} tabIndex={0} aria-label={`${p.label}: ${p.total} stores, ${p.added} new`} className="group relative h-full flex-1 outline-none">
          <div className="absolute inset-y-0 left-1/2 hidden w-px bg-slate-300 group-hover:block group-focus:block" />
          <div className="pointer-events-none absolute top-0 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus:block">
            <p className="font-semibold tabular-nums">{p.total} stores</p>
            <p className="text-slate-300">+{p.added} on {p.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
