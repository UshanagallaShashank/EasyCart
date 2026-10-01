// A store's five newest orders, as seen by a platform admin (read-only).
import { StatusBadge } from '@/components/status-badge';
import { getOrderStatusTone, getPaymentStatusTone } from '@/lib/status-colors';
import { formatMoney, formatOrderDate, shortOrderId } from '@/features/orders/lib/order-rules';
import type { AdminTenantDetail } from '../types/admin-types';

export function TenantRecentOrders({ orders }: { orders: AdminTenantDetail['activity']['recent_orders'] }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">Recent orders</h2>
      {!orders.length ? <p className="py-6 text-center text-sm text-slate-500">This store has no orders yet.</p> : (
        <ul className="mt-2 divide-y divide-slate-100">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 py-3">
              <div className="min-w-0"><p className="text-sm font-medium text-slate-900">{shortOrderId(o.id)}</p><p className="text-xs text-slate-500">{formatOrderDate(o.created_at)}</p></div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={getOrderStatusTone(o.status)} value={o.status} />
                <StatusBadge tone={getPaymentStatusTone(o.payment_status)} value={o.payment_status} />
                <span className="w-24 text-right text-sm font-semibold tabular-nums">{formatMoney(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
