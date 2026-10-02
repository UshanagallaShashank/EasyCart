// Every delivery on the platform: which store, which rider, where it is now, and the cash involved.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, PackageCheck, Truck, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { SearchField } from '@/components/search-field';
import { usePagination } from '@/components/pagination/use-pagination';
import { PaginationBar } from '@/components/pagination/pagination-bar';
import { format_price } from '@/lib/format-price';
import { AdminPageTitle } from '@/features/admin/components/page-title';
import { StatTile } from '@/features/rider/components/stat-tile';
import { ToneBadge } from '@/features/delivery/components/tone-badge';
import { deliveryStageLabel, formatDateTime } from '@/features/delivery/lib/delivery-labels';
import type { AdminDeliveryRow } from '@/features/delivery/types/delivery-types';
import { useAdminDeliveries } from '../hooks/use-admin-riders';

type View = 'all' | 'searching' | 'on_the_way' | 'delivered' | 'not_started' | 'cancelled';

const VIEWS: { value: View; label: string; test(row: AdminDeliveryRow): boolean }[] = [
  { value: 'all', label: 'All', test: () => true },
  { value: 'searching', label: 'Finding rider', test: (r) => r.stage === 'ready_for_delivery' || (r.stage === 'rider_assigned' && r.rider_offer_status === 'offered') },
  { value: 'on_the_way', label: 'On the way', test: (r) => (r.stage === 'rider_assigned' && r.rider_offer_status === 'accepted') || r.stage === 'dispatched' },
  { value: 'delivered', label: 'Delivered', test: (r) => r.stage === 'delivered' },
  { value: 'not_started', label: 'At store', test: (r) => r.stage === 'not_started' },
  { value: 'cancelled', label: 'Cancelled', test: (r) => r.stage === 'cancelled' }
];

export function DeliveriesPage() {
  const { data, isLoading } = useAdminDeliveries();
  const rows = data ?? [];
  const [view, setView] = useState<View>('all');
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const test = VIEWS.find((v) => v.value === view)!.test;
  const visible = rows.filter(test).filter((r) => `${r.id} ${r.store_name} ${r.rider_name ?? ''} ${r.delivery_address ?? ''}`.toLowerCase().includes(term));
  const { page, setPage, pageSize, setPageSize, totalPages, start, end, pageItems } = usePagination(visible, `${view}|${search}`);
  const today = new Date().toDateString();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Deliveries" description="Live view of every delivery order across all stores. Refreshes every 30 seconds." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Loader2} label="Finding rider" value={String(rows.filter(VIEWS[1].test).length)} />
        <StatTile icon={Truck} label="On the way" value={String(rows.filter(VIEWS[2].test).length)} />
        <StatTile icon={PackageCheck} label="Delivered today" value={String(rows.filter((r) => r.delivered_at && new Date(r.delivered_at).toDateString() === today).length)} />
        <StatTile icon={Wallet} label="Cash collected" value={format_price(rows.reduce((sum, r) => sum + (r.cash_collected ?? 0), 0))} />
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterPills<View> options={VIEWS.map((v) => ({ value: v.value, label: v.label, count: rows.filter(v.test).length }))} value={view} onChange={setView} />
        <SearchField value={search} onChange={setSearch} placeholder="Search order, store, rider" />
      </div>
      {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : visible.length === 0 ? <EmptyState message={rows.length ? 'No deliveries match.' : 'No delivery orders yet.'} /> : (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            {pageItems.map((row) => {
              const stage = deliveryStageLabel(row.stage, row.rider_offer_status);
              return (
                <li key={row.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900">#{row.id.slice(0, 8)}</span>
                      <ToneBadge tone={stage.tone} label={stage.label} />
                      <Link to={`/admin/stores/${row.tenant_id}`} className="truncate text-sm font-medium text-slate-800 hover:text-sky-700">{row.store_name}</Link>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {row.rider_id ? <Link to={`/admin/riders/${row.rider_id}`} className="font-medium text-sky-700 hover:underline">{row.rider_name ?? 'Rider'}</Link> : 'No rider'} · {row.delivery_address}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 text-xs sm:block sm:text-right">
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">{format_price(row.total)}</p>
                    <p className="text-slate-400">{formatDateTime(row.delivered_at ?? row.created_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} start={start} end={end} total={visible.length} noun="deliveries" onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      )}
    </div>
  );
}
