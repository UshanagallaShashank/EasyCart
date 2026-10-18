// Leaderboard of the stores with the most sales, each with a bar showing its share of the leader.
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { formatMoney } from '@/features/orders/lib/order-rules';
import type { PlatformStats } from '../types/admin-types';

export function TopStoresCard({ stores }: { stores: PlatformStats['top_stores'] }) {
  const leader = stores[0]?.revenue || 1;

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Trophy className="size-4 text-amber-500" /> Top stores by sales</h2>
      {!stores.length ? <p className="py-8 text-center text-sm text-slate-500">No sales yet.</p> : (
        <ol className="mt-4 flex flex-col gap-4">
          {stores.map((s, i) => (
            <li key={s.tenant_id}>
              <div className="flex items-baseline justify-between gap-3">
                <Link to={`/admin/stores/${s.tenant_id}`} className="min-w-0 truncate text-sm font-medium text-slate-900 hover:text-sky-700"><span className="mr-2 text-slate-400 tabular-nums">{i + 1}</span>{s.name}</Link>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{formatMoney(s.revenue)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0284C7]" style={{ width: `${(s.revenue / leader) * 100}%` }} /></div>
                <span className="w-20 text-right text-xs text-slate-500">{s.orders} {s.orders === 1 ? 'order' : 'orders'}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
