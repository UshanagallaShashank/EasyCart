// Platform admin overview, focused on today: weekly header, things needing action, activity, and shortcuts.
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
