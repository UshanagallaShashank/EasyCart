// Growth insights: stores and people only — total stores over time, store funnel, health, user mix, newest stores.
import { Skeleton } from '@/components/ui/skeleton';
import { useTenants } from '../hooks/use-tenants';
import { usePlatformStats } from '../hooks/use-platform-stats';
import { AdminPageTitle } from '../components/page-title';
import { CumulativeStoresChart } from '../components/cumulative-stores-chart';
import { StoreFunnelCard } from '../components/store-funnel-card';
import { StoreHealthCard } from '../components/store-health-card';
import { UserMixCard } from '../components/user-mix-card';
import { NewestStoresTable } from '../components/newest-stores-table';

export function GrowthInsightsPage() {
  const { data: tenants } = useTenants();
  const { data: stats } = usePlatformStats();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Growth" description="Stores and people joining EasyCart, and how far new stores get." />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">{tenants ? <CumulativeStoresChart tenants={tenants} /> : <Skeleton className="h-80 w-full rounded-2xl" />}</div>
        {tenants ? <StoreFunnelCard tenants={tenants} /> : <Skeleton className="h-80 w-full rounded-2xl" />}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {tenants ? <StoreHealthCard tenants={tenants} /> : <Skeleton className="h-56 w-full rounded-2xl" />}
        {stats ? <UserMixCard totals={stats.totals} /> : <Skeleton className="h-56 w-full rounded-2xl" />}
      </div>
      {tenants ? <NewestStoresTable tenants={tenants} /> : <Skeleton className="h-72 w-full rounded-2xl" />}
    </div>
  );
}
