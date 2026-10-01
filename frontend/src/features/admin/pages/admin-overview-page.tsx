// Platform admin overview: weekly header, platform totals, 30-day sales, top stores, user and store breakdowns, stores needing attention.
import { Skeleton } from '@/components/ui/skeleton';
import { useTenants } from '../hooks/use-tenants';
import { usePlatformStats } from '../hooks/use-platform-stats';
import { get_week_trend } from '../lib/get-week-trend';
import { AdminHero } from '../components/admin-hero';
import { PlatformKpis } from '../components/platform-kpis';
import { PlatformRevenueChart } from '../components/platform-revenue-chart';
import { TopStoresCard } from '../components/top-stores-card';
import { UserMixCard } from '../components/user-mix-card';
import { StoreHealthCard } from '../components/store-health-card';
import { TenantSignupsChart } from '../components/tenant-signups-chart';
import { RecentTenantsCard } from '../components/recent-tenants-card';
import { NeedsAttentionCard } from '../components/needs-attention-card';

export function AdminOverviewPage() {
  const { data: tenants } = useTenants();
  const { data: stats } = usePlatformStats();
  const trend = stats ? get_week_trend(stats.daily_revenue) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <AdminHero sales={trend?.sales} orders={trend?.orders} pending={stats?.totals.pending_orders} />
      {stats && trend ? <PlatformKpis totals={stats.totals} sales={trend.sales} orders={trend.orders} /> : <Skeleton className="h-32 w-full rounded-2xl" />}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">{stats ? <PlatformRevenueChart series={stats.daily_revenue} /> : <Skeleton className="h-80 w-full rounded-2xl" />}</div>
        {stats ? <TopStoresCard stores={stats.top_stores} /> : <Skeleton className="h-80 w-full rounded-2xl" />}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats ? <UserMixCard totals={stats.totals} /> : <Skeleton className="h-56 w-full rounded-2xl" />}
        {tenants ? <StoreHealthCard tenants={tenants} /> : <Skeleton className="h-56 w-full rounded-2xl" />}
        <div className="md:col-span-2 xl:col-span-1">{tenants ? <NeedsAttentionCard tenants={tenants} /> : <Skeleton className="h-56 w-full rounded-2xl" />}</div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">{tenants ? <TenantSignupsChart tenants={tenants} /> : <Skeleton className="h-80 w-full rounded-2xl" />}</div>
        {tenants ? <RecentTenantsCard tenants={tenants} /> : <Skeleton className="h-80 w-full rounded-2xl" />}
      </div>
    </div>
  );
}
