// Getting-started checklist with progress bar; hides itself once every step is complete.
import { Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SetupStep } from '../lib/get-setup-steps';

export function SetupChecklist({ steps }: { steps: SetupStep[] }) {
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;

  return (
    <section className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50 to-white p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-sm font-semibold text-slate-900">Set up your store</h2><p className="text-xs text-slate-500">{done} of {steps.length} done</p></div>
        <div className="h-2 w-28 overflow-hidden rounded-full bg-sky-100 sm:w-40" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={steps.length}>
          <div className="h-full rounded-full bg-sky-500 transition-[width] duration-500" style={{ width: `${(done / steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((s) => (
          <li key={s.key}>
            <Link to={s.to} className={cn('group flex h-full items-center gap-3 rounded-xl border bg-white p-3 transition-colors', s.done ? 'border-slate-100' : 'border-slate-200 hover:border-sky-300')}>
              <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full border', s.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent')}><Check className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className={cn('block text-sm font-semibold', s.done ? 'text-slate-400 line-through' : 'text-slate-900')}>{s.label}</span><span className="block truncate text-xs text-slate-500">{s.hint}</span></span>
              {!s.done && <ChevronRight className="size-4 shrink-0 text-slate-300 group-hover:text-sky-500" />}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
