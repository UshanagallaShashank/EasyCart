// Sales headline numbers: total sales, orders, average order value, and pending orders.
import { IndianRupee, ShoppingBag, Receipt, Clock } from 'lucide-react';
import { formatMoney } from '@/features/orders/lib/order-rules';
import type { PlatformStats } from '../types/admin-types';

export function SalesKpis({ totals, series }: { totals: PlatformStats['totals']; series: PlatformStats['daily_revenue'] }) {
  const recentSales = series.reduce((sum, d) => sum + d.revenue, 0);
  const recentOrders = series.reduce((sum, d) => sum + d.orders, 0);
  const kpis = [
    { label: 'Total sales', value: formatMoney(totals.gmv), hint: 'Excludes cancelled orders', icon: IndianRupee, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: totals.orders, hint: 'All stores, all time', icon: ShoppingBag, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Avg. order value', value: recentOrders ? formatMoney(recentSales / recentOrders) : '—', hint: 'Last 30 days, excl. cancelled', icon: Receipt, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Pending orders', value: totals.pending_orders, hint: 'Waiting on store owners', icon: Clock, tone: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center gap-2"><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${k.tone}`}><k.icon className="size-4" /></span><p className="text-xs leading-tight font-medium text-slate-600 sm:text-sm">{k.label}</p></div>
          <p className="mt-3 font-heading text-lg leading-tight font-bold break-words text-slate-900 tabular-nums sm:text-[26px]">{k.value}</p>
          <p className="mt-1 text-xs text-slate-500">{k.hint}</p>
        </div>
      ))}
    </div>
  );
}
