// Small figure with a label, used in rows of rider stats.
import type { LucideIcon } from 'lucide-react';

export function StatTile({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Icon className="size-3.5 text-sky-500" /> {label}</span>
      <span className="truncate text-xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</span>
      {hint && <span className="truncate text-[11px] text-slate-400">{hint}</span>}
    </div>
  );
}
