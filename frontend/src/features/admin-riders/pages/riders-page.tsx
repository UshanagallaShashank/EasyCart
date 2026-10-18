// Platform admin list of delivery partners: review queue, who is online, and sorting by distance to any store.
import { useState } from 'react';
import { Bike, Clock3, Radio, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { SearchField } from '@/components/search-field';
import { usePagination } from '@/components/pagination/use-pagination';
import { PaginationBar } from '@/components/pagination/pagination-bar';
import { format_price } from '@/lib/format-price';
import { AdminPageTitle } from '@/features/admin/components/page-title';
import { StatTile } from '@/features/rider/components/stat-tile';
import { useAdminRiders } from '../hooks/use-admin-riders';
import { useRiderListFilter, type RiderFilter, type RiderSort } from '../hooks/use-rider-list-filter';
import { RiderList } from '../components/rider-list';

const SORT_LABELS: Record<RiderSort, string> = { newest: 'Newest first', nearest: 'Nearest to a store', city: 'City and area', deliveries: 'Most deliveries', cash: 'Most cash in hand' };

export function RidersPage() {
  const [nearStore, setNearStore] = useState('');
  const { data, isLoading } = useAdminRiders(nearStore || undefined);
  const riders = data?.riders ?? [];
  const { search, setSearch, filter, setFilter, sort, setSort, visible, options } = useRiderListFilter(riders);
  const { page, setPage, pageSize, setPageSize, totalPages, start, end, pageItems } = usePagination(visible, `${search}|${filter}|${sort}|${nearStore}`);
  const stores = data?.stores ?? [];

  function handleSort(next: RiderSort) {
    setSort(next);
    if (next === 'nearest' && !nearStore) setNearStore(stores.find((store) => store.has_location)?.tenant_id ?? '');
    if (next !== 'nearest') setNearStore('');
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Delivery partners" description="Review applications, check documents and see who can deliver where." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Bike} label="Partners" value={String(riders.length)} hint={`${riders.filter((r) => r.status === 'approved').length} approved`} />
        <StatTile icon={Clock3} label="Waiting for review" value={String(riders.filter((r) => r.status === 'pending').length)} />
        <StatTile icon={Radio} label="Online now" value={String(riders.filter((r) => r.status === 'approved' && r.is_online).length)} />
        <StatTile icon={Wallet} label="Cash with riders" value={format_price(riders.reduce((sum, r) => sum + r.cash_in_hand, 0))} hint="Not yet handed in" />
      </div>

      <div className="flex flex-col gap-3">
        <FilterPills<RiderFilter> options={options} value={filter} onChange={setFilter} />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchField value={search} onChange={setSearch} placeholder="Search name, phone, plate, pincode" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-medium text-slate-500">Sort by</span>
            <Select value={sort} onValueChange={(v) => handleSort(v as RiderSort)}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(SORT_LABELS) as RiderSort[]).map((key) => <SelectItem key={key} value={key}>{SORT_LABELS[key]}</SelectItem>)}</SelectContent>
            </Select>
            {sort === 'nearest' && (
              <Select value={nearStore} onValueChange={setNearStore}>
                <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Choose a store" /></SelectTrigger>
                <SelectContent>
                  {stores.map((store) => <SelectItem key={store.tenant_id} value={store.tenant_id} disabled={!store.has_location}>{store.name}{!store.has_location && ' (no location)'}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : visible.length ? (
        <div className="flex flex-col gap-4">
          <RiderList riders={pageItems} showDistance={sort === 'nearest' && Boolean(nearStore)} />
          <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} start={start} end={end} total={visible.length} noun="partners" onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      ) : <EmptyState message={riders.length ? 'No partners match your filters.' : 'No delivery partners have signed up yet. Share /rider/register with riders.'} />}
    </div>
  );
}
