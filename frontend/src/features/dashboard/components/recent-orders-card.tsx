// The five newest orders, linking to each order's page.
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { getOrderStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { formatMoney, formatOrderDate, shortOrderId } from '@/features/orders/lib/order-rules';
import type { Order } from '@/features/orders/types/order-types';

export function RecentOrdersCard({ orders }: { orders: Order[] | undefined }) {
  const recent = (orders ?? []).slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ClipboardList className="size-4 text-sky-500" /> Recent orders
        </h2>
        <Link to="/dashboard/orders" className="group flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700">
          View all <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      {!recent.length ? (
        <EmptyState message="Orders will show up here as customers check out." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((order) => (
            <li key={order.id}>
              <Link
                to={`/dashboard/orders/${order.id}`}
                className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{shortOrderId(order.id)}</p>
                  <p className="text-xs text-slate-400">{formatOrderDate(order.created_at)} · {order.fulfillment_method === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge>
                  <span className="w-20 text-right sm:w-28 text-sm font-semibold tabular-nums">{formatMoney(order.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
