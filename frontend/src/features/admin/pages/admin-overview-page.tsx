// Platform admin overview: platform totals, 30-day sales, top stores, store counts and sign-ups, and stores needing attention.
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/shared/auth/auth-context';
import { useTenants } from '../hooks/use-tenants';
import { usePlatformStats } from '../hooks/use-platform-stats';
import { PlatformKpis } from '../components/platform-kpis';
import { PlatformRevenueChart } from '../components/platform-revenue-chart';
import { TopStoresCard } from '../components/top-stores-card';
import { TenantStats } from '../components/tenant-stats';
import { TenantSignupsChart } from '../components/tenant-signups-chart';
import { RecentTenantsCard } from '../components/recent-tenants-card';
import { NeedsAttentionCard } from '../components/needs-attention-card';

export function AdminOverviewPage() {
  const { user } = useAuth();
  const { data: tenants } = useTenants();
  const { data: stats } = usePlatformStats();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Welcome, {user?.username}</h1><p className="mt-1 text-sm text-slate-500">How EasyCart is doing across every store.</p></div>
        <Link to="/admin/stores" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800">Manage stores <ArrowRight className="size-4" /></Link>
      </div>
      {stats ? <PlatformKpis totals={stats.totals} /> : <Skeleton className="h-28 w-full rounded-2xl" />}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">{stats ? <PlatformRevenueChart series={stats.daily_revenue} /> : <Skeleton className="h-80 w-full rounded-2xl" />}</div>
        {stats ? <TopStoresCard stores={stats.top_stores} /> : <Skeleton className="h-80 w-full rounded-2xl" />}
      </div>
      <h2 className="-mb-2 text-sm font-semibold tracking-wider text-slate-400 uppercase">Stores</h2>
      {tenants ? (
        <>
          <TenantStats tenants={tenants} />
          <TenantSignupsChart tenants={tenants} />
          <div className="grid gap-5 lg:grid-cols-2"><NeedsAttentionCard tenants={tenants} /><RecentTenantsCard tenants={tenants} /></div>
        </>
      ) : <Skeleton className="h-80 w-full rounded-2xl" />}
    </div>
  );
}
