// Phone-sized summary of one store order: id, total, items, date, method, and status pills.
import { Link } from 'react-router-dom';
import { ChevronRight, Store, Truck } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { getOrderStatusTone, getPaymentStatusTone } from '@/lib/status-colors';
import { formatMoney, formatOrderDate, shortOrderId } from '../lib/order-rules';
import type { Order } from '../types/order-types';

export function OrderCard({ order }: { order: Order }) {
  const items = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const Icon = order.fulfillment_method === 'delivery' ? Truck : Store;

  return (
    <Link to={`/dashboard/orders/${order.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs active:bg-slate-50">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-semibold text-slate-900">{shortOrderId(order.id)}</p>
          <p className="font-semibold tabular-nums">{formatMoney(order.total)}</p>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><Icon className="size-3.5" /> {formatOrderDate(order.created_at)} · {items} {items === 1 ? 'item' : 'items'}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusBadge tone={getOrderStatusTone(order.status)} value={order.status} />
          <StatusBadge tone={getPaymentStatusTone(order.payment_status)} value={order.payment_status} />
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-slate-300" />
    </Link>
  );
}
