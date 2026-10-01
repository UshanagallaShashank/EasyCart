// Platform admin store list: counts, then a searchable, filterable list of every store.
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { SearchField } from '@/components/search-field';
import { useTenants } from '../hooks/use-tenants';
import { useTenantListFilter, type TenantFilter } from '../hooks/use-tenant-list-filter';
import { TenantStats } from '../components/tenant-stats';
import { TenantTable } from '../components/tenant-table';

export function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const { search, setSearch, filter, setFilter, visible, options } = useTenantListFilter(tenants ?? []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Stores</h1>
        <p className="mt-1 text-sm text-slate-500">Every business on EasyCart. Open a store to see its owner, numbers, and recent orders.</p>
      </div>
      {isLoading ? <Skeleton className="h-28 w-full rounded-2xl" /> : <TenantStats tenants={tenants ?? []} />}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterPills<TenantFilter> options={options} value={filter} onChange={setFilter} />
        <SearchField value={search} onChange={setSearch} placeholder="Search store or owner" />
      </div>
      {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : visible.length ? <TenantTable tenants={visible} /> : <EmptyState message={tenants?.length ? 'No stores match your filters.' : 'No stores yet.'} />}
    </div>
  );
}
