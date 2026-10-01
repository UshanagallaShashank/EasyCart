// Platform admin store list: counts, filters, search, sort, CSV export, and the store table.
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { SearchField } from '@/components/search-field';
import { useTenants } from '../hooks/use-tenants';
import { useTenantListFilter, type TenantFilter } from '../hooks/use-tenant-list-filter';
import { export_tenants_csv } from '../lib/export-tenants-csv';
import { TenantStats } from '../components/tenant-stats';
import { TenantTable } from '../components/tenant-table';
import { TenantSortSelect } from '../components/tenant-sort-select';

export function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const { search, setSearch, filter, setFilter, sort, setSort, visible, options } = useTenantListFilter(tenants ?? []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Stores</h1><p className="mt-1 text-sm text-slate-500">Every business on EasyCart. Open a store to see its owner, numbers, and recent orders.</p></div>
        <Button variant="outline" size="lg" disabled={!visible.length} onClick={() => export_tenants_csv(visible)}><Download /> Export CSV</Button>
      </div>
      {isLoading ? <Skeleton className="h-28 w-full rounded-2xl" /> : <TenantStats tenants={tenants ?? []} />}
      <FilterPills<TenantFilter> options={options} value={filter} onChange={setFilter} />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchField value={search} onChange={setSearch} placeholder="Search store or owner" className="md:w-80" />
        <TenantSortSelect value={sort} onChange={setSort} />
      </div>
      {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : visible.length ? <TenantTable tenants={visible} /> : <EmptyState message={tenants?.length ? 'No stores match your filters.' : 'No stores yet.'} />}
    </div>
  );
}
