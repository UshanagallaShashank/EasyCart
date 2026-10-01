// One headline number on the overview, with an icon and a soft colored glow.
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from './animated-number';

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  /** Tailwind classes for the icon bubble, e.g. "bg-sky-100 text-sky-600" */
  tone: string;
  decimals?: number;
  prefix?: string;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, tone, decimals, prefix, hint }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-lg hover:shadow-sky-500/10"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <div className="mt-2 font-heading text-2xl font-bold text-slate-900">
            {value === undefined ? <Skeleton className="h-8 w-24" /> : <AnimatedNumber value={value} decimals={decimals} prefix={prefix} />}
          </div>
          {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
        </div>
        <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </motion.div>
  );
}
