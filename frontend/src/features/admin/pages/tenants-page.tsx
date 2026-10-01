// Platform admin store list: counts, filters, search, sort, pagination, multi-select bulk actions, and CSV export.
import { useState, useMemo, useEffect } from 'react';
import { Download, CheckSquare, ShieldAlert, ShieldCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { SearchField } from '@/components/search-field';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useTenants } from '../hooks/use-tenants';
import { useTenantListFilter, type TenantFilter } from '../hooks/use-tenant-list-filter';
import { useBulkSuspendTenants, useBulkReactivateTenants } from '../hooks/use-bulk-tenant-actions';
import { export_tenants_csv } from '../lib/export-tenants-csv';
import { TenantStats } from '../components/tenant-stats';
import { TenantTable } from '../components/tenant-table';
import { TenantSortSelect } from '../components/tenant-sort-select';
import { AdminPageTitle } from '../components/page-title';

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const { search, setSearch, filter, setFilter, sort, setSort, visible, options } = useTenantListFilter(tenants ?? []);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const bulkSuspend = useBulkSuspendTenants();
  const bulkReactivate = useBulkReactivateTenants();

  // Reset page and selection when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filter, sort]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(visible.length / pageSize));

  // Ensure page is valid when visible count changes
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = pageSize === -1 ? 0 : (page - 1) * pageSize;
  const endIndex = pageSize === -1 ? visible.length : Math.min(startIndex + pageSize, visible.length);
  const paginatedTenants = useMemo(() => {
    return pageSize === -1 ? visible : visible.slice(startIndex, endIndex);
  }, [visible, startIndex, endIndex, pageSize]);

  // Selection helpers for the current page
  const isAllSelected = paginatedTenants.length > 0 && paginatedTenants.every((t) => selectedIds.includes(t.id));
  const isSomeSelected = paginatedTenants.some((t) => selectedIds.includes(t.id)) && !isAllSelected;

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function handleToggleSelectAll() {
    if (isAllSelected) {
      const pageIds = new Set(paginatedTenants.map((t) => t.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const combined = new Set([...selectedIds, ...paginatedTenants.map((t) => t.id)]);
      setSelectedIds([...combined]);
    }
  }

  function handleBulkSuspend() {
    if (!selectedIds.length) return;
    bulkSuspend.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`Successfully suspended ${selectedIds.length} store(s)`);
        setSelectedIds([]);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to suspend selected stores');
      }
    });
  }

  function handleBulkReactivate() {
    if (!selectedIds.length) return;
    bulkReactivate.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`Successfully reactivated ${selectedIds.length} store(s)`);
        setSelectedIds([]);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to reactivate selected stores');
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Stores" description="Every business on EasyCart. Open a store to see its owner, numbers, and recent orders.">
        <Button variant="outline" size="lg" disabled={!visible.length} onClick={() => export_tenants_csv(visible)}>
          <Download className="size-4 mr-1.5" /> Export CSV
        </Button>
      </AdminPageTitle>
      {isLoading ? <Skeleton className="h-28 w-full rounded-2xl" /> : <TenantStats tenants={tenants ?? []} />}

      <FilterPills<TenantFilter> options={options} value={filter} onChange={setFilter} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchField value={search} onChange={setSearch} placeholder="Search store or owner" className="md:w-80" />
        <TenantSortSelect value={sort} onChange={setSort} />
      </div>

      {/* Bulk action toolbar when stores are selected */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/90 px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-4 text-sky-600" />
            <span className="text-sm font-semibold text-sky-950">
              {selectedIds.length} {selectedIds.length === 1 ? 'store' : 'stores'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ConfirmDialog
              title={`Suspend ${selectedIds.length} store${selectedIds.length > 1 ? 's' : ''}?`}
              description="The selected store owners will lose dashboard access and their storefronts will go offline until reactivated."
              confirmLabel="Suspend stores"
              onConfirm={handleBulkSuspend}
              trigger={
                <Button variant="destructive" size="sm" disabled={bulkSuspend.isPending}>
                  <ShieldAlert className="size-3.5 mr-1" />
                  {bulkSuspend.isPending ? 'Suspending…' : 'Suspend selected'}
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              disabled={bulkReactivate.isPending}
              onClick={handleBulkReactivate}
              className="bg-white hover:bg-slate-50 text-slate-800"
            >
              <ShieldCheck className="size-3.5 mr-1 text-emerald-600" />
              {bulkReactivate.isPending ? 'Reactivating…' : 'Reactivate selected'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="size-3.5 mr-1" /> Deselect all
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : visible.length ? (
        <div className="flex flex-col gap-4">
          <TenantTable
            tenants={paginatedTenants}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
          />

          {/* Pagination controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2 pt-1 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="font-semibold text-slate-900">{startIndex + 1}</strong>–
                <strong className="font-semibold text-slate-900">{endIndex}</strong> of{' '}
                <strong className="font-semibold text-slate-900">{visible.length}</strong> stores
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-xs text-slate-500">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-sky-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={-1}>All ({visible.length})</option>
                </select>
              </div>
            </div>

            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs"
                >
                  <ChevronLeft className="size-3.5 mr-0.5" /> Prev
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers(page, totalPages).map((p, idx) =>
                    typeof p === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => setPage(p)}
                        className={`size-8 rounded-lg text-xs font-medium transition-colors ${
                          p === page
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-slate-400 text-xs">
                        {p}
                      </span>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 text-xs"
                >
                  Next <ChevronRight className="size-3.5 ml-0.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState message={tenants?.length ? 'No stores match your filters.' : 'No stores yet.'} />
      )}
    </div>
  );
}
