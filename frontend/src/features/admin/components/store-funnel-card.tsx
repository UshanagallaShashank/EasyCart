// Store funnel: created → published → live (published and not suspended), with conversion between steps.
import { ChevronDown } from 'lucide-react';
import type { AdminTenant } from '../types/admin-types';

export function StoreFunnelCard({ tenants }: { tenants: AdminTenant[] }) {
  const steps = [
    { label: 'Created a store', value: tenants.length },
    { label: 'Published it', value: tenants.filter((t) => t.is_published).length },
    { label: 'Live now', value: tenants.filter((t) => t.is_published && t.status === 'active').length }
  ];
  const top = steps[0].value || 1;

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">Store funnel</h2>
      <p className="mt-1 mb-4 text-xs text-slate-500">How far stores get after signing up</p>
      <ol className="flex flex-col gap-1">
        {steps.map((s, i) => (
          <li key={s.label}>
            {i > 0 && <p className="flex items-center gap-1 py-1 pl-1 text-xs text-slate-500"><ChevronDown className="size-3.5" /> {steps[i - 1].value ? Math.round((s.value / steps[i - 1].value) * 100) : 0}% continue</p>}
            <div className="flex items-baseline justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{s.label}</span><span className="font-semibold tabular-nums">{s.value}</span></div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0284C7]" style={{ width: `${(s.value / top) * 100}%`, opacity: 1 - i * 0.2 }} /></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
