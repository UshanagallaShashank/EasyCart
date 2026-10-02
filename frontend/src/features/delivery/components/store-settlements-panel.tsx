import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, CheckCircle2, Clock, HandCoins, Info, Phone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { format_price } from '@/lib/format-price';
import { useSettleOrderDelivery, useStoreSettlements } from '../hooks/use-store-delivery';
import { formatDateTime } from '../lib/delivery-labels';
import type { StoreSettlementSummary } from '../types/delivery-types';
import { OrderSettlementModal } from './order-settlement-modal';

type Filter = 'pending' | 'settled' | 'all';

export function StoreSettlementsPanel() {
  const { data, isLoading } = useStoreSettlements();
  const [filter, setFilter] = useState<Filter>('pending');
  const [activeOrder, setActiveOrder] = useState<StoreSettlementSummary['orders'][number] | null>(null);

  const settleMutation = useSettleOrderDelivery(activeOrder?.order_id || '');

  const summary = data?.summary;
  const allOrders = data?.orders || [];
  const visible = allOrders.filter((order) => {
    if (filter === 'pending') return !order.is_settled;
    if (filter === 'settled') return order.is_settled;
    return true;
  });

  const filterOptions = [
    { value: 'pending' as const, label: 'Pending settlement', count: summary?.pending_orders_count ?? 0 },
    { value: 'settled' as const, label: 'Settled', count: summary?.settled_orders_count ?? 0 },
    { value: 'all' as const, label: 'All deliveries', count: allOrders.length }
  ];

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <HandCoins className="size-4 text-sky-600" />
            Partner Payments & Cash Settlements
          </h2>
          <p className="text-xs text-slate-500">
            Reconcile cash collected by delivery partners and disburse ride earnings.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : (
        <>
          {/* Summary Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-amber-800 block">Pending Cash to Collect</span>
                <span className="text-xl font-bold text-amber-900 tabular-nums">
                  {format_price(summary?.pending_cash_from_riders ?? 0)}
                </span>
                <span className="text-[11px] text-amber-700/80 block mt-0.5">
                  {summary?.pending_orders_count ?? 0} COD deliveries uncollected
                </span>
              </div>
              <Wallet className="size-5 text-amber-600 shrink-0 mt-0.5" />
            </div>

            <div className="rounded-xl border border-sky-200/80 bg-sky-50/60 p-3.5 flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-sky-800 block">Ride Fees Payable</span>
                <span className="text-xl font-bold text-sky-900 tabular-nums">
                  {format_price(summary?.pending_rider_payouts ?? 0)}
                </span>
                <span className="text-[11px] text-sky-700/80 block mt-0.5">
                  Earnings for delivery partners
                </span>
              </div>
              <HandCoins className="size-5 text-sky-600 shrink-0 mt-0.5" />
            </div>

            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3.5 flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-800 block">Total Settled Cash</span>
                <span className="text-xl font-bold text-emerald-900 tabular-nums">
                  {format_price(summary?.settled_cash_total ?? 0)}
                </span>
                <span className="text-[11px] text-emerald-700/80 block mt-0.5">
                  {summary?.settled_orders_count ?? 0} deliveries reconciled
                </span>
              </div>
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <FilterPills<Filter> options={filterOptions} value={filter} onChange={setFilter} />
          </div>

          {visible.length === 0 ? (
            <EmptyState message="No delivery settlements found for this filter." />
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200/80 overflow-hidden">
              {visible.map((row) => (
                <li key={row.order_id} className="p-3.5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/dashboard/orders/${row.order_id}`}
                        className="font-mono text-xs font-bold text-sky-700 hover:underline"
                      >
                        #{row.order_id.slice(0, 8)}
                      </Link>
                      {row.is_settled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="size-3" /> Settled ({row.method || 'Cash'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <Clock className="size-3" /> Awaiting Payment
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Delivered {formatDateTime(row.delivered_at || row.created_at)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>Partner: <strong className="text-slate-900 font-medium">{row.rider_name || 'Assigned Rider'}</strong></span>
                      {row.rider_phone && (
                        <a href={`tel:${row.rider_phone}`} className="inline-flex items-center gap-1 text-sky-600 hover:underline">
                          <Phone className="size-3" /> {row.rider_phone}
                        </a>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-slate-500">Customer Cash: <strong className="text-slate-900 tabular-nums">{format_price(row.cash_collected)}</strong></span>
                      <span className="text-slate-500">Store Share: <strong className="text-slate-900 tabular-nums">{format_price(row.store_amount)}</strong></span>
                      <span className="text-emerald-700">Ride Fee: <strong className="tabular-nums">+{format_price(row.rider_earning)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-500 block">Net to Receive</span>
                      <span className="text-base font-extrabold text-sky-900 tabular-nums">
                        {format_price(row.net_to_store)}
                      </span>
                    </div>

                    {!row.is_settled && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setActiveOrder(row)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs h-8 px-3 gap-1.5 cursor-pointer"
                      >
                        <Banknote className="size-3.5" />
                        Settle Payment
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

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
          partnerName={activeOrder.rider_name}
          role="store"
          onSettle={(payload) => settleMutation.mutateAsync(payload)}
        />
      )}
    </section>
  );
}
