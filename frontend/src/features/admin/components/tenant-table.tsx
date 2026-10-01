// Store list for platform admins: cards on phones, a table on larger screens.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { getTenantStatusTone } from '@/lib/status-colors';
import { formatOrderDate } from '@/features/orders/lib/order-rules';
import { TenantAction } from './tenant-action';
import type { AdminTenant } from '../types/admin-types';

function TenantIdentity({ tenant }: { tenant: AdminTenant }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">{tenant.name.charAt(0).toUpperCase()}</span>
      <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{tenant.name}</p><a href={`/${tenant.slug}`} target="_blank" rel="noreferrer" className="truncate text-xs text-slate-500 hover:text-sky-700">/{tenant.slug}</a></div>
    </div>
  );
}

export function TenantTable({ tenants }: { tenants: AdminTenant[] }) {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {tenants.map((t) => (
          <li key={t.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3"><TenantIdentity tenant={t} /><StatusBadge tone={getTenantStatusTone(t.status)} value={t.status} /></div>
            <p className="mt-3 truncate text-sm text-slate-700">{[t.owner_username, t.owner_email].filter(Boolean).join(' · ') || 'Owner unknown'}</p>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><p className="text-xs text-slate-500">{t.is_published ? 'Published' : 'Not published'} · {formatOrderDate(t.created_at)}</p><TenantAction tenant={t} /></div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs md:block">
        <Table>
          <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="pl-5">Store</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead>Storefront</TableHead><TableHead>Created</TableHead><TableHead className="pr-5 text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {tenants.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="max-w-xs py-3 pl-5"><TenantIdentity tenant={t} /></TableCell>
                <TableCell>{t.owner_username || t.owner_email ? <><p className="text-slate-900">{t.owner_username ?? '—'}</p><p className="text-xs text-slate-500">{t.owner_email ?? '—'}</p></> : <span className="text-slate-400">Owner unknown</span>}</TableCell>
                <TableCell><StatusBadge tone={getTenantStatusTone(t.status)} value={t.status} /></TableCell>
                <TableCell className="text-slate-600">{t.is_published ? 'Published' : 'Not published'}</TableCell>
                <TableCell className="text-slate-500">{formatOrderDate(t.created_at)}</TableCell>
                <TableCell className="pr-5 text-right"><TenantAction tenant={t} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
