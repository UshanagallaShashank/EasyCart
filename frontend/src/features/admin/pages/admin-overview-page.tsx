// Platform admin overview: store counts, sign-ups chart, newest stores, and stores needing attention.
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/shared/auth/auth-context';
import { useTenants } from '../hooks/use-tenants';
import { TenantStats } from '../components/tenant-stats';
import { TenantSignupsChart } from '../components/tenant-signups-chart';
import { RecentTenantsCard } from '../components/recent-tenants-card';
import { NeedsAttentionCard } from '../components/needs-attention-card';

export function AdminOverviewPage() {
  const { user } = useAuth();
  const { data: tenants, isLoading } = useTenants();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Welcome, {user?.username}</h1><p className="mt-1 text-sm text-slate-500">A snapshot of every store on EasyCart.</p></div>
        <Link to="/admin/stores" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800">Manage stores <ArrowRight className="size-4" /></Link>
      </div>
      {isLoading || !tenants ? <Skeleton className="h-96 w-full rounded-2xl" /> : (
        <>
          <TenantStats tenants={tenants} />
          <TenantSignupsChart tenants={tenants} />
          <div className="grid gap-5 lg:grid-cols-2">
            <NeedsAttentionCard tenants={tenants} />
            <RecentTenantsCard tenants={tenants} />
          </div>
        </>
      )}
    </div>
  );
}
