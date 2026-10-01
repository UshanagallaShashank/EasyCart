// Platform admin store list: counts, filters, search, sort, pagination, multi-select bulk actions, and CSV export.
import { useState } from 'react';
import { Download, CheckSquare, ShieldAlert, ShieldCheck, X } from 'lucide-react';
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
import { usePagination } from '@/components/pagination/use-pagination';
import { PaginationBar } from '@/components/pagination/pagination-bar';

export function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const { search, setSearch, filter, setFilter, sort, setSort, visible, options } = useTenantListFilter(tenants ?? []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const bulkSuspend = useBulkSuspendTenants();
  const bulkReactivate = useBulkReactivateTenants();
  const { page, setPage, pageSize, setPageSize, totalPages, start, end, pageItems: paginatedTenants } = usePagination(visible, `${search}|${filter}|${sort}`);

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

          <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} start={start} end={end} total={visible.length} noun="stores" onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      ) : (
        <EmptyState message={tenants?.length ? 'No stores match your filters.' : 'No stores yet.'} />
      )}
    </div>
  );
}
