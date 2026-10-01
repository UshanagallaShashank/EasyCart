// Row of pill buttons that switch a list between filter views, each with an optional count.
import { cn } from '@/lib/utils';

interface FilterPillsProps<T extends string> {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange(value: T): void;
}

export function FilterPills<T extends string>({ options, value, onChange }: FilterPillsProps<T>) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition-colors',
            value === o.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
          )}
        >
          {o.label}
          {o.count !== undefined && <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', value === o.value ? 'bg-white/20' : 'bg-slate-100 text-slate-500')}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
