import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenants } from '../hooks/use-tenants';
import { usePlatformStats } from '../hooks/use-platform-stats';
import { get_week_trend } from '../lib/get-week-trend';
import { AdminHero } from '../components/admin-hero';
import { ActionTiles } from '../components/action-tiles';
import { NeedsAttentionCard } from '../components/needs-attention-card';
import { ActivityFeed } from '../components/activity-feed';
import { AdminShortcuts } from '../components/admin-shortcuts';

export function AdminOverviewPage() {
  const { data: tenants } = useTenants();
  const { data: stats } = usePlatformStats();
  const trend = stats ? get_week_trend(stats.daily_revenue) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <AdminHero sales={trend?.sales} orders={trend?.orders} pending={stats?.totals.pending_orders} />

      {tenants && tenants.filter((t) => t.status === 'pending').length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-bold text-white shadow-xs">
              {tenants.filter((t) => t.status === 'pending').length}
            </span>
            <div>
              <p className="font-bold text-sm text-amber-950">Store Applications Pending Review</p>
              <p className="text-xs text-amber-800">
                {tenants.filter((t) => t.status === 'pending').length === 1
                  ? 'There is 1 new store request waiting for your review.'
                  : `There are ${tenants.filter((t) => t.status === 'pending').length} new store requests waiting for your review.`}
              </p>
            </div>
          </div>
          <Link
            to="/admin/stores?status=requests"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-950 shadow-2xs hover:bg-amber-100 transition-colors"
          >
            Review requests <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase">Needs your action</h2>
        {tenants ? <ActionTiles tenants={tenants} totals={stats?.totals} /> : <Skeleton className="h-40 w-full rounded-2xl" />}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {tenants ? <NeedsAttentionCard tenants={tenants} /> : <Skeleton className="h-72 w-full rounded-2xl" />}
        {tenants ? <ActivityFeed tenants={tenants} /> : <Skeleton className="h-72 w-full rounded-2xl" />}
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase">Go to</h2>
        <AdminShortcuts />
      </div>
    </div>
  );
}
