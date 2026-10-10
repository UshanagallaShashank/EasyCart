import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Store, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getOrderStatusTone, getPaymentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { customerOrderPath, getLastStoreSlug } from '@/features/storefront/lib/customer-paths';
import type { Order } from '../types/order-types';
import { formatMoney, formatOrderDate, shortOrderId } from '../lib/order-rules';

export function CustomerOrderCard({ order }: { order: Order }) {
  const { slug } = useParams<{ slug?: string }>();
  const shopSlug = slug || getLastStoreSlug();
  const targetPath = shopSlug ? customerOrderPath(shopSlug, order.id) : '/';

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const firstItem = order.items[0];
  const otherItemsCount = order.items.length - 1;
  const FulfillmentIcon = order.fulfillment_method === 'delivery' ? Truck : Store;

  return (
    <Link
      to={targetPath}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        <FulfillmentIcon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{shortOrderId(order.id)}</span>
          <Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge>
          <Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge>
        </div>
        <p className="mt-1 truncate text-sm text-slate-500">
          {firstItem.name}
          {otherItemsCount > 0 && ` +${otherItemsCount} more`} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
        <p className="text-xs text-slate-400">{formatOrderDate(order.created_at)}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold tabular-nums">{formatMoney(order.total)}</p>
      </div>
      <ChevronRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500" />
    </Link>
  );
}
