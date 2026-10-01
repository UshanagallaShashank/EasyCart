// One headline number on the overview, with an icon and an optional hint line.
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from './animated-number';

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  tone: string;
  decimals?: number;
  prefix?: string;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, tone, decimals, prefix, hint }: StatCardProps) {
  return (
    <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex items-center gap-2">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="size-4" /></span>
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
      <div className="mt-3 truncate font-heading text-xl font-bold text-slate-900 sm:text-2xl">
        {value === undefined ? <Skeleton className="h-8 w-24" /> : <AnimatedNumber value={value} decimals={decimals} prefix={prefix} />}
      </div>
      {hint && <p className="mt-1 truncate text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}
