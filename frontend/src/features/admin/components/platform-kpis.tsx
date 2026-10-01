// Platform-wide headline numbers (total sales, orders, customers, store owners) with weekly change where known.
import type { ReactNode } from 'react';
import { IndianRupee, ShoppingBag, Users, Briefcase, type LucideIcon } from 'lucide-react';
import { formatMoney } from '@/features/orders/lib/order-rules';
import { TrendBadge } from './trend-badge';
import type { Trend } from '../lib/get-week-trend';
import type { PlatformStats } from '../types/admin-types';

interface Kpi { label: string; value: string | number; hint: ReactNode; icon: LucideIcon; tone: string }

export function PlatformKpis({ totals, sales, orders }: { totals: PlatformStats['totals']; sales: Trend; orders: Trend }) {
  const kpis: Kpi[] = [
    { label: 'Total sales', value: formatMoney(totals.gmv), hint: <><TrendBadge trend={sales} /> <span>this week</span></>, icon: IndianRupee, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: totals.orders, hint: <><TrendBadge trend={orders} /> <span>this week</span></>, icon: ShoppingBag, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Customers', value: totals.customers, hint: 'Shopper accounts', icon: Users, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Store owners', value: totals.owners, hint: `${totals.admins} platform ${totals.admins === 1 ? 'admin' : 'admins'}`, icon: Briefcase, tone: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center gap-2"><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${k.tone}`}><k.icon className="size-4" /></span><p className="text-xs leading-tight font-medium text-slate-600 sm:text-sm">{k.label}</p></div>
          <p className="mt-3 font-heading text-lg leading-tight font-bold break-words text-slate-900 tabular-nums sm:text-[26px]">{k.value}</p>
          <div className="mt-1 flex min-h-5 flex-wrap items-center gap-1.5 text-xs text-slate-500">{k.hint}</div>
        </div>
      ))}
    </div>
  );
}
