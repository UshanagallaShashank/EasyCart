// Store list for platform admins: cards on phones, a table on larger screens.
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { formatOrderDate, formatMoney } from '@/features/orders/lib/order-rules';
import { TenantAction } from './tenant-action';
import { SortableHead } from './sortable-head';
import { get_store_state } from '../lib/get-store-state';
import type { TenantSort } from '../hooks/use-tenant-list-filter';
import type { AdminTenant } from '../types/admin-types';

function TenantIdentity({ tenant }: { tenant: AdminTenant }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">
        {tenant.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <span className="block truncate font-semibold text-slate-900 group-hover:text-sky-700">
          {tenant.name}
        </span>
        <a
          href={`/${tenant.slug}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="block truncate text-xs text-slate-500 hover:text-sky-700"
        >
          /{tenant.slug}
        </a>
      </div>
    </div>
  );
}

interface TenantTableProps {
  tenants: AdminTenant[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
  sort?: TenantSort;
  onSortChange?(sort: TenantSort): void;
}

export function TenantTable({
  tenants,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected = false,
  isSomeSelected = false,
  sort,
  onSortChange
}: TenantTableProps) {
  const navigate = useNavigate();

  function handleRowClick(e: React.MouseEvent, id: string) {
    const target = e.target as HTMLElement;
    if (target.closest('input[type="checkbox"], button, a, [role="button"], [data-prevent-row-click="true"]')) {
      return;
    }
    navigate(`/admin/stores/${id}`);
  }

  return (
    <>
      <ul className="flex flex-col gap-3 xl:hidden">
        {tenants.map((t) => {
          const isSelected = selectedIds.includes(t.id);
          return (
            <li
              key={t.id}
              onClick={(e) => handleRowClick(e, t.id)}
              className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-colors ${
                isSelected ? 'border-sky-300 bg-sky-50/40' : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {onToggleSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(t.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${t.name}`}
                      className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  )}
                  <TenantIdentity tenant={t} />
                </div>
                <StatusBadge tone={get_store_state(t).tone} value={get_store_state(t).label} />
              </div>
              <p className="mt-3 truncate text-sm text-slate-700" title={[t.owner_username, t.owner_email].filter(Boolean).join(' · ')}>
                {[t.owner_username, t.owner_email].filter(Boolean).join(' · ') || 'Owner unknown'}
              </p>
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-100 pt-2 text-xs text-slate-600">
                <span>Customers: <strong className="font-semibold text-slate-900">{t.customer_count ?? 0}</strong></span>
                <span>Revenue: <strong className="font-semibold text-slate-900">{formatMoney(t.revenue ?? 0)}</strong></span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500">
                  Created {formatOrderDate(t.created_at)}
                </p>
                <div onClick={(e) => e.stopPropagation()}>
                  <TenantAction tenant={t} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs xl:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
              {onToggleSelectAll && (
                <TableHead className="w-12 pl-4 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={onToggleSelectAll}
                    aria-label="Select all stores on this page"
                    className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer align-middle"
                  />
                </TableHead>
              )}
              <SortableHead label="Store" sorts={['name']} ascending={['name']} current={sort} onSort={onSortChange} className={onToggleSelectAll ? 'pl-2' : 'pl-5'} />
              <TableHead>Owner</TableHead>
              <TableHead>State</TableHead>
              <SortableHead label="Customers" sorts={['customers']} current={sort} onSort={onSortChange} className="text-right" />
              <SortableHead label="Revenue" sorts={['revenue']} current={sort} onSort={onSortChange} className="text-right" />
              <SortableHead label="Created" sorts={['newest', 'oldest']} ascending={['oldest']} current={sort} onSort={onSortChange} className="hidden 2xl:table-cell" />
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => {
              const isSelected = selectedIds.includes(t.id);
              return (
                <TableRow
                  key={t.id}
                  onClick={(e) => handleRowClick(e, t.id)}
                  className={`group cursor-pointer transition-colors ${
                    isSelected ? 'bg-sky-50/50 hover:bg-sky-50/80' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {onToggleSelect && (
                    <TableCell className="w-12 pl-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(t.id)}
                        aria-label={`Select ${t.name}`}
                        className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer align-middle"
                      />
                    </TableCell>
                  )}
                  <TableCell className={`max-w-52 py-3 2xl:max-w-60 ${onToggleSelect ? 'pl-2' : 'pl-5'}`}>
                    <TenantIdentity tenant={t} />
                  </TableCell>
                  <TableCell className="max-w-44 2xl:max-w-56">
                    {t.owner_username || t.owner_email ? (
                      <>
                        <p className="truncate text-slate-900">{t.owner_username ?? '—'}</p>
                        <p className="truncate text-xs text-slate-500" title={t.owner_email ?? undefined}>{t.owner_email ?? '—'}</p>
                      </>
                    ) : (
                      <span className="text-slate-400">Owner unknown</span>
                    )}
                  </TableCell>
                  <TableCell title={get_store_state(t).hint}>
                    <StatusBadge tone={get_store_state(t).tone} value={get_store_state(t).label} />
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-700 tabular-nums">
                    {t.customer_count ?? 0}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900 tabular-nums">
                    {formatMoney(t.revenue ?? 0)}
                  </TableCell>
                  <TableCell className="hidden text-slate-500 2xl:table-cell">
                    {formatOrderDate(t.created_at)}
                  </TableCell>
                  <TableCell className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <TenantAction tenant={t} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
