// Line chart of the total number of stores over the last 30 days, with an area wash and hover crosshair.
import { get_nice_max } from '@/lib/get-nice-max';
import { get_cumulative_stores } from '../lib/get-cumulative-stores';
import { LineChartHover } from './line-chart-hover';
import type { AdminTenant } from '../types/admin-types';

const DAYS = 30;

export function CumulativeStoresChart({ tenants }: { tenants: AdminTenant[] }) {
  const points = get_cumulative_stores(tenants.map((t) => t.created_at), DAYS);
  const max = get_nice_max(Math.max(1, ...points.map((p) => p.total)));
  const xy = points.map((p, i) => [(i / (DAYS - 1)) * 100, 100 - (p.total / max) * 100]);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const gained = points[DAYS - 1].total - points[0].total + points[0].added;

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">Total stores, last 30 days</h2>
      <p className="mt-1 font-heading text-2xl font-bold text-slate-900 tabular-nums">{points[DAYS - 1].total} <span className="text-sm font-medium text-slate-500">stores · +{gained} in 30 days</span></p>
      <div className="mt-5 flex h-48 gap-3">
        <div className="flex flex-col justify-between pb-6 text-right text-[11px] text-slate-400 tabular-nums" aria-hidden>{[max, max / 2, 0].map((t) => <span key={t} className="-translate-y-1/2 leading-none">{Number.isInteger(t) ? t : ''}</span>)}</div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden>{[0, 1, 2].map((i) => <div key={i} className="h-px bg-slate-100" />)}</div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <path d={`${line} L100,100 L0,100 Z`} fill="#0284C7" fillOpacity="0.1" />
              <path d={line} fill="none" stroke="#0284C7" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0284C7] ring-2 ring-white" style={{ left: '100%', top: `${xy[DAYS - 1][1]}%` }} />
            <LineChartHover points={points} />
          </div>
          <div className="flex h-6 justify-between pt-1.5 text-[11px] text-slate-500" aria-hidden><span>{points[0].label}</span><span>{points[14].label}</span><span>{points[DAYS - 1].label}</span></div>
        </div>
      </div>
    </section>
  );
}
