// Growth insights: new stores over time, store health, users by role, and the newest stores.
import { Skeleton } from '@/components/ui/skeleton';
import { useTenants } from '../hooks/use-tenants';
import { usePlatformStats } from '../hooks/use-platform-stats';
import { AdminPageTitle } from '../components/page-title';
import { TenantStats } from '../components/tenant-stats';
import { TenantSignupsChart } from '../components/tenant-signups-chart';
import { StoreHealthCard } from '../components/store-health-card';
import { UserMixCard } from '../components/user-mix-card';
import { RecentTenantsCard } from '../components/recent-tenants-card';

export function GrowthInsightsPage() {
  const { data: tenants } = useTenants();
  const { data: stats } = usePlatformStats();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Growth" description="How many stores and people are joining EasyCart, and how healthy the stores are." />
      {tenants ? <TenantStats tenants={tenants} /> : <Skeleton className="h-28 w-full rounded-2xl" />}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">{tenants ? <TenantSignupsChart tenants={tenants} /> : <Skeleton className="h-80 w-full rounded-2xl" />}</div>
        {tenants ? <RecentTenantsCard tenants={tenants} /> : <Skeleton className="h-80 w-full rounded-2xl" />}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {tenants ? <StoreHealthCard tenants={tenants} /> : <Skeleton className="h-56 w-full rounded-2xl" />}
        {stats ? <UserMixCard totals={stats.totals} /> : <Skeleton className="h-56 w-full rounded-2xl" />}
      </div>
    </div>
  );
}
