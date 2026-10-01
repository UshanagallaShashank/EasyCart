// Six headline numbers for one store: revenue, orders, pending, customers, products, and low stock.
import { IndianRupee, ShoppingBag, Clock, Users, Package, AlertTriangle } from 'lucide-react';
import { formatMoney } from '@/features/orders/lib/order-rules';
import type { AdminTenantDetail } from '../types/admin-types';

export function TenantMetrics({ activity }: { activity: AdminTenantDetail['activity'] }) {
  const metrics = [
    { label: 'Revenue', value: formatMoney(activity.revenue), hint: 'Excludes cancelled', icon: IndianRupee, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: activity.order_count, hint: 'All time', icon: ShoppingBag, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Pending', value: activity.pending_order_count, hint: 'Awaiting the owner', icon: Clock, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Customers', value: activity.customer_count, hint: 'Who have ordered', icon: Users, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Products', value: activity.product_count, hint: `${activity.active_product_count} active`, icon: Package, tone: 'bg-slate-100 text-slate-600' },
    { label: 'Low stock', value: activity.low_stock_count, hint: 'At or below threshold', icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2"><span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${m.tone}`}><m.icon className="size-4" /></span><p className="truncate text-xs font-medium text-slate-500">{m.label}</p></div>
          <p className="mt-3 truncate font-heading text-xl font-bold text-slate-900 tabular-nums">{m.value}</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-400">{m.hint}</p>
        </div>
      ))}
    </div>
  );
}
