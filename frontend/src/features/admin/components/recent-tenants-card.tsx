// The five most recently created stores, newest first.
import { StatusBadge } from '@/components/status-badge';
import { getTenantStatusTone } from '@/lib/status-colors';
import { formatOrderDate } from '@/features/orders/lib/order-rules';
import type { AdminTenant } from '../types/admin-types';

export function RecentTenantsCard({ tenants }: { tenants: AdminTenant[] }) {
  const recent = [...tenants].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">Newest stores</h2>
      {!recent.length ? <p className="py-6 text-center text-sm text-slate-500">No stores yet.</p> : (
        <ul className="mt-3 divide-y divide-slate-100">
          {recent.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{t.name}</p><p className="text-xs text-slate-500">{formatOrderDate(t.created_at)}</p></div>
              <StatusBadge tone={getTenantStatusTone(t.status)} value={t.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
