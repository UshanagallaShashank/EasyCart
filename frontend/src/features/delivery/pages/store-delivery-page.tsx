// Store owner's delivery hub: pickup location, every delivery order and its rider, and partners near the store.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, ChevronRight, Radar } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { format_price } from '@/lib/format-price';
import { useRidersNearby, useStoreDeliveries, useStoreSettlements } from '../hooks/use-store-delivery';
import { SettlementsPanel } from '../components/settlement/settlements-panel';
import { ToneBadge } from '../components/tone-badge';
import { VEHICLE_LABELS, deliveryStageLabel, formatDateTime, formatDistance } from '../lib/delivery-labels';

type View = 'active' | 'done' | 'all';
const ACTIVE = ['not_started', 'ready_for_delivery', 'rider_assigned', 'dispatched'];

function DeliveriesList() {
  const { data: deliveries, isLoading } = useStoreDeliveries();
  const [view, setView] = useState<View>('active');
  const list = deliveries ?? [];
  const visible = list.filter((row) => view === 'all' || (view === 'active' ? ACTIVE.includes(row.stage) : !ACTIVE.includes(row.stage)));
  const options = [
    { value: 'active' as const, label: 'In progress', count: list.filter((row) => ACTIVE.includes(row.stage)).length },
    { value: 'done' as const, label: 'Finished', count: list.filter((row) => !ACTIVE.includes(row.stage)).length },
    { value: 'all' as const, label: 'All', count: list.length }
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Delivery orders</h2>
        <FilterPills<View> options={options} value={view} onChange={setView} />
      </div>
      {isLoading ? <Skeleton className="h-48 w-full rounded-2xl" /> : visible.length === 0 ? <EmptyState message="No delivery orders here." /> : (
        <ul className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          {visible.slice(0, 50).map((row) => {
            const stage = deliveryStageLabel(row.stage, row.rider_offer_status);
            return (
              <li key={row.id}>
                <Link to={`/dashboard/orders/${row.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-semibold text-slate-900">#{row.id.slice(0, 8)}</span><ToneBadge tone={stage.tone} label={stage.label} /></div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{row.rider_name ? `${row.rider_name} · ` : ''}{row.delivery_address}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">{format_price(row.total)}</p>
                    <p className="text-[11px] text-slate-400">{formatDateTime(row.delivered_at ?? row.created_at)}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function NearbyRiders() {
  const { data, isLoading } = useRidersNearby();
  const riders = data?.riders ?? [];
  const online = riders.filter((rider) => rider.is_available).length;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div><h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Radar className="size-4 text-sky-500" /> Partners near you</h2><p className="text-xs text-slate-500">{data?.store_location ? 'Nearest first from your pickup location' : <>Pin your store in <Link to="/dashboard/store" className="font-semibold text-sky-600 hover:underline">Store settings</Link> to sort by distance</>}</p></div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{online} online</span>
      </div>
      {isLoading ? <Skeleton className="h-40 w-full rounded-xl" /> : riders.length === 0 ? <p className="py-6 text-center text-xs text-slate-500">No approved delivery partners yet.</p> : (
        <ul className="flex flex-col divide-y divide-slate-100">
          {riders.slice(0, 12).map((rider) => (
            <li key={rider.id} className="flex items-center gap-3 py-2.5">
              <span className={`size-2.5 shrink-0 rounded-full ${rider.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-label={rider.is_available ? 'Online' : 'Offline'} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{rider.full_name}</p>
                <p className="truncate text-xs text-slate-500">{rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : 'Vehicle'} · {[rider.area, rider.city].filter(Boolean).join(', ') || 'Area not set'}</p>
              </div>
              <div className="shrink-0 text-right text-xs">
                <p className="font-semibold text-slate-700">{formatDistance(rider.distance_km)}</p>
                {rider.active_orders > 0 && <p className="text-slate-400">{rider.active_orders} on the way</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StoreSettlements() {
  const { data, isLoading } = useStoreSettlements();
  return <SettlementsPanel side="store" rows={data?.orders} isLoading={isLoading} />;
}

export function StoreDeliveryPage() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Delivery" description="Verified EasyCart partners pick up from your store and deliver with code, photo and cash checks." />
      <PageBody>
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <Bike className="mt-0.5 size-5 shrink-0 text-sky-600" />
          <p>How it works: pack the order, open it and tap <strong>Packed, send for delivery</strong>. We find the nearest rider automatically, you give them the pickup code, and they can only finish the delivery with the customer's own code.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
            {/* What needs attention now comes first; money to reconcile follows. */}
            <DeliveriesList />
            <StoreSettlements />
          </div>
          <div className="flex min-w-0 flex-col gap-5"><NearbyRiders /></div>
        </div>
      </PageBody>
    </div>
  );
}
