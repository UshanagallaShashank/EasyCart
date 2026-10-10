// Stores an admin may want to look at: suspended ones and active stores that are not published yet.
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { AdminTenant } from '../types/admin-types';

export function NeedsAttentionCard({ tenants }: { tenants: AdminTenant[] }) {
  const items = [
    ...tenants.filter((t) => t.status === 'pending').map((t) => ({ tenant: t, reason: 'Pending approval' })),
    ...tenants.filter((t) => t.status === 'suspended').map((t) => ({ tenant: t, reason: 'Suspended' })),
    ...tenants.filter((t) => t.status === 'active' && !t.is_published).map((t) => ({ tenant: t, reason: 'Not published yet' }))
  ].slice(0, 6);

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><AlertTriangle className="size-4 text-amber-500" /> Needs attention</h2>
      {!items.length ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center"><CheckCircle2 className="size-8 text-emerald-400" /><p className="text-sm text-slate-500">All stores are live and active.</p></div>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.map(({ tenant, reason }) => (
            <li key={tenant.id}>
              <Link to={`/admin/stores/${tenant.id}`} className="group flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 group-hover:text-sky-700">{tenant.name}</p>
                  <p className={`text-xs ${
                    reason === 'Suspended'
                      ? 'text-rose-600'
                      : reason === 'Pending approval'
                      ? 'text-amber-600 font-semibold'
                      : 'text-amber-700'
                  }`}>
                    {reason}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-slate-300 group-hover:text-sky-500" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
