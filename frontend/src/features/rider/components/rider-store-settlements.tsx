import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, CheckCircle2, Clock, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { format_price } from '@/lib/format-price';
import { useRiderPayStore, useRiderSettlements } from '../hooks/use-rider-queries';
import { formatDateTime } from '@/features/delivery/lib/delivery-labels';
import { OrderSettlementModal } from '@/features/delivery/components/order-settlement-modal';
import type { RiderSettlementSummary } from '@/features/delivery/types/delivery-types';

type SettlementFilter = 'need_to_pay' | 'paid' | 'all';

export function RiderStoreSettlements() {
  const { data, isLoading } = useRiderSettlements();
  const [filter, setFilter] = useState<SettlementFilter>('need_to_pay');
  const [activeOrder, setActiveOrder] = useState<RiderSettlementSummary['orders'][number] | null>(null);

  const payMutation = useRiderPayStore(activeOrder?.order_id || '');
  const orders = data?.orders || [];
  const summary = data?.summary;

  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />;
  if (orders.length === 0) return null;

  const visibleOrders = orders.filter((order) => {
    if (filter === 'need_to_pay') return !order.is_settled;
    if (filter === 'paid') return order.is_settled;
    return true;
  });

  const filterOptions = [
    {
      value: 'need_to_pay' as const,
      label: 'Need to be paid',
      count: summary?.pending_orders_count ?? 0
    },
    {
      value: 'paid' as const,
      label: 'Paid',
      count: summary?.settled_orders_count ?? 0
    },
    {
      value: 'all' as const,
      label: 'All deliveries',
      count: orders.length
    }
  ];

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Store className="size-4 text-sky-600" />
              Store Settlements & Ride Payouts
            </h3>
            <p className="text-xs text-slate-500">
              Track customer cash remittances to stores and ride fee payouts paid out to you.
            </p>
          </div>
          {summary?.pending_orders_count ? (
            <span className="self-start sm:self-auto rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              {summary.pending_orders_count} pending settlement
            </span>
          ) : (
            <span className="self-start sm:self-auto rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              All settled & paid
            </span>
          )}
        </div>

        {/* Separated Overview Cards: Need to be Paid vs Paid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Need to be paid tile */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Clock className="size-3.5 text-amber-600" /> Need to be Paid
              </span>
              <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                {summary?.pending_orders_count ?? 0} Pending
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <span className="text-[11px] text-amber-700/80 block">Cash in Hand to Hand In</span>
                <span className="text-lg font-extrabold text-amber-950 tabular-nums">
                  {format_price(summary?.pending_cash_to_stores ?? 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-amber-700/80 block">Ride Fee Owed to You</span>
                <span className="text-lg font-extrabold text-emerald-700 tabular-nums">
                  +{format_price(summary?.pending_ride_earnings ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Paid / Settled tile */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" /> Paid & Settled
              </span>
              <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                {summary?.settled_orders_count ?? 0} Settled
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <span className="text-[11px] text-emerald-700/80 block">Ride Payouts Received</span>
                <span className="text-lg font-extrabold text-emerald-900 tabular-nums">
                  +{format_price(summary?.settled_cash_total ?? 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-700/80 block">Cash Remitted to Stores</span>
                <span className="text-lg font-extrabold text-slate-800 tabular-nums">
                  {format_price(summary?.settled_store_cash ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between pt-1">
          <FilterPills<SettlementFilter> options={filterOptions} value={filter} onChange={setFilter} />
        </div>

        {/* Order List */}
        {visibleOrders.length === 0 ? (
          <EmptyState
            message={
              filter === 'need_to_pay'
                ? 'All clear! No deliveries currently need settlement with stores.'
                : filter === 'paid'
                ? 'No settled deliveries yet. Once settled by the store owner or you, they will appear here.'
                : 'No delivery settlements found.'
            }
          />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200/80 overflow-hidden">
            {visibleOrders.map((row) => (
              <li
                key={row.order_id}
                className="p-3.5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{row.store_name}</span>
                    <Link
                      to={`/rider/orders/${row.order_id}`}
                      className="font-mono text-xs font-bold text-sky-700 hover:underline"
                    >
                      #{row.order_id.slice(0, 8)}
                    </Link>

                    {row.is_settled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="size-3" /> Paid & Settled ({row.method || 'Cash'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        <Clock className="size-3" /> Need to be Paid
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      Delivered {formatDateTime(row.delivered_at || row.created_at)}
                    </span>
                  </div>

                  {/* Financial breakdown */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="text-slate-500">
                      Customer cash collected:{' '}
                      <strong className="text-slate-900 tabular-nums">
                        {format_price(row.cash_collected)}
                      </strong>
                    </span>

                    {row.is_settled ? (
                      <>
                        <span className="text-emerald-700 font-medium">
                          Ride payout received:{' '}
                          <strong className="tabular-nums">+{format_price(row.rider_earning)}</strong>
                        </span>
                        <span className="text-slate-600">
                          Cash remitted to store:{' '}
                          <strong className="text-slate-900 tabular-nums">{format_price(row.store_amount)}</strong>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-700 font-medium">
                          Ride fee due to you:{' '}
                          <strong className="tabular-nums">+{format_price(row.rider_earning)}</strong>
                        </span>
                        <span className="text-amber-800">
                          Net cash to hand in:{' '}
                          <strong className="tabular-nums">{format_price(row.net_to_store)}</strong>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Settled metadata */}
                  {row.is_settled && (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span>
                        Settled by {row.settled_by === 'rider' ? 'You' : 'Store Owner'} on{' '}
                        {formatDateTime(row.settled_at || row.delivered_at)}
                      </span>
                      {row.note && <span className="italic text-slate-400">· {row.note}</span>}
                    </div>
                  )}
                </div>

                {/* Right action / status block */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {row.is_settled ? (
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-emerald-700 font-medium block flex items-center gap-1 justify-start sm:justify-end">
                        <CheckCircle2 className="size-3 text-emerald-600" /> Settled
                      </span>
                      <span className="text-sm font-bold text-emerald-800 tabular-nums">
                        +{format_price(row.rider_earning)} received
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-slate-500 block">Pay to Store</span>
                        <span className="text-base font-extrabold text-sky-900 tabular-nums">
                          {format_price(row.net_to_store)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setActiveOrder(row)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs h-8 px-3 gap-1.5 cursor-pointer shrink-0"
                      >
                        <Banknote className="size-3.5" />
                        Pay Store
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeOrder && (
        <OrderSettlementModal
          open={!!activeOrder}
          onOpenChange={(open) => {
            if (!open) setActiveOrder(null);
          }}
          orderId={activeOrder.order_id}
          settlement={{
            order_id: activeOrder.order_id,
            cash_collected: activeOrder.cash_collected,
            rider_earning: activeOrder.rider_earning,
            store_amount: activeOrder.store_amount,
            net_to_store: activeOrder.net_to_store,
            is_cod: activeOrder.is_cod,
            is_settled: activeOrder.is_settled,
            settled_at: activeOrder.settled_at,
            settled_by: activeOrder.settled_by,
            method: activeOrder.method,
            note: activeOrder.note
          }}
          storeName={activeOrder.store_name}
          role="rider"
          onSettle={(payload) => payMutation.mutateAsync(payload)}
        />
      )}
    </>
  );
}
