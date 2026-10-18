// Week-over-week change pill with an arrow and sign, so direction never relies on color alone.
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Trend } from '../lib/get-week-trend';

export function TrendBadge({ trend, onDark = false }: { trend: Trend; onDark?: boolean }) {
  if (trend.change === null) return <span className={cn('text-xs', onDark ? 'text-sky-100' : 'text-slate-500')}>New this week</span>;
  const rounded = Math.round(trend.change);
  const Icon = rounded > 0 ? ArrowUpRight : rounded < 0 ? ArrowDownRight : Minus;
  const tone = onDark ? 'bg-white/15 text-white' : rounded > 0 ? 'bg-emerald-50 text-emerald-700' : rounded < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600';

  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums', tone)} title="Last 7 days vs the 7 days before">
      <Icon className="size-3.5" /> {rounded > 0 ? '+' : ''}{rounded}%
    </span>
  );
}
