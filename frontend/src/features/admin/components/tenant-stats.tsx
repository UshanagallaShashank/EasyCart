// Headline counts across all stores, using the same states as the filters: Live, Not published, Suspended.
import { Store, CheckCircle2, EyeOff, Ban } from 'lucide-react';
import { get_store_state } from '../lib/get-store-state';
import type { AdminTenant } from '../types/admin-types';

export function TenantStats({ tenants }: { tenants: AdminTenant[] }) {
  const stats = [
    { label: 'Stores', value: tenants.length, icon: Store, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Live', value: tenants.filter((t) => get_store_state(t).label === 'live').length, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Not published', value: tenants.filter((t) => get_store_state(t).label === 'not published').length, icon: EyeOff, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Suspended', value: tenants.filter((t) => get_store_state(t).label === 'suspended').length, icon: Ban, tone: 'bg-rose-50 text-rose-600' }
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
