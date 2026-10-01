// Platform-wide headline numbers: total sales, orders, customers, and store owners.
import { IndianRupee, ShoppingBag, Users, Briefcase } from 'lucide-react';
import { formatMoney } from '@/features/orders/lib/order-rules';
import type { PlatformStats } from '../types/admin-types';

export function PlatformKpis({ totals }: { totals: PlatformStats['totals'] }) {
  const kpis = [
    { label: 'Total sales', value: formatMoney(totals.gmv), hint: 'All stores, excl. cancelled', icon: IndianRupee, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: totals.orders, hint: `${totals.pending_orders} pending`, icon: ShoppingBag, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Customers', value: totals.customers, hint: 'Shopper accounts', icon: Users, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Store owners', value: totals.owners, hint: `${totals.admins} platform ${totals.admins === 1 ? "admin" : "admins"}`, icon: Briefcase, tone: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center gap-2"><span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${k.tone}`}><k.icon className="size-4" /></span><p className="truncate text-xs font-medium text-slate-500">{k.label}</p></div>
          <p className="mt-3 truncate font-heading text-xl font-bold text-slate-900 tabular-nums sm:text-2xl">{k.value}</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-400">{k.hint}</p>
        </div>
      ))}
    </div>
  );
}
