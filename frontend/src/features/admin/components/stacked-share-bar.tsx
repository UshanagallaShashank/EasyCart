// Part-to-whole horizontal bar with 2px gaps between segments and a legend carrying each value, share, and optional icon.
import type { LucideIcon } from 'lucide-react';

export interface ShareSegment {
  label: string;
  value: number;
  color: string;
  icon?: LucideIcon;
}

export function StackedShareBar({ segments, unit }: { segments: ShareSegment[]; unit: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const share = (value: number) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-slate-100" role="img" aria-label={segments.map((s) => `${s.label}: ${s.value} ${unit}`).join(', ')}>
        {segments.filter((s) => s.value > 0).map((s) => <div key={s.label} title={`${s.label}: ${s.value} (${share(s.value)}%)`} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} />)}
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-slate-700">{s.icon ? <s.icon className="size-4" style={{ color: s.color }} /> : <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />}{s.label}</span>
            <span className="tabular-nums text-slate-900"><b className="font-semibold">{s.value}</b> <span className="text-slate-500">· {share(s.value)}%</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
