// The ten newest stores with owner, state, and join date; each row opens the store page.
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/status-badge';
import { getTenantStatusTone } from '@/lib/status-colors';
import { formatOrderDate } from '@/features/orders/lib/order-rules';
import type { AdminTenant } from '../types/admin-types';

export function NewestStoresTable({ tenants }: { tenants: AdminTenant[] }) {
  const rows = [...tenants].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between px-5 pt-5 pb-3"><h2 className="text-sm font-semibold text-slate-900">Newest stores</h2><Link to="/admin/stores" className="text-xs font-semibold text-sky-700 hover:underline">See all</Link></div>
      <div>
        <table className="w-full table-fixed text-sm">
          <thead className="bg-slate-50/70 text-left text-xs text-slate-500"><tr><th className="w-[45%] py-2.5 pr-2 pl-4 font-medium sm:w-[35%] sm:px-5">Store</th><th className="hidden py-2.5 font-medium sm:table-cell">Owner</th><th className="py-2.5 font-medium">State</th><th className="hidden px-5 py-2.5 text-right font-medium md:table-cell">Joined</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="truncate py-2.5 pr-2 pl-4 sm:px-5"><Link to={`/admin/stores/${t.id}`} className="font-medium text-slate-900 hover:text-sky-700">{t.name}</Link></td>
                <td className="hidden truncate py-2.5 pr-2 text-slate-600 sm:table-cell">{t.owner_username ?? '—'}</td>
                <td className="py-2.5 pr-4 sm:pr-2"><div className="flex flex-wrap gap-1.5"><StatusBadge tone={getTenantStatusTone(t.status)} value={t.status} />{!t.is_published && <StatusBadge tone="neutral" value="not published" />}</div></td>
                <td className="hidden px-5 py-2.5 text-right text-slate-500 md:table-cell">{formatOrderDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
