// Headline counts across all stores on the platform.
import { Store, CheckCircle2, Globe, Ban } from 'lucide-react';
import type { AdminTenant } from '../types/admin-types';

export function TenantStats({ tenants }: { tenants: AdminTenant[] }) {
  const stats = [
    { label: 'Stores', value: tenants.length, icon: Store, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Active', value: tenants.filter((t) => t.status === 'active').length, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Published', value: tenants.filter((t) => t.is_published).length, icon: Globe, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Suspended', value: tenants.filter((t) => t.status === 'suspended').length, icon: Ban, tone: 'bg-rose-50 text-rose-600' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center gap-2"><span className={`flex size-7 items-center justify-center rounded-lg ${s.tone}`}><s.icon className="size-4" /></span><p className="text-xs font-medium text-slate-500">{s.label}</p></div>
          <p className="mt-3 font-heading text-2xl font-bold text-slate-900 tabular-nums">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
