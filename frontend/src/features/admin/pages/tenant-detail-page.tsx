// One store as seen by a platform admin: status and actions, numbers, storefront and owner, recent orders.
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { getTenantStatusTone } from '@/lib/status-colors';
import { formatOrderDate } from '@/features/orders/lib/order-rules';
import { useTenantDetail } from '../hooks/use-tenant-detail';
import { TenantAction } from '../components/tenant-action';
import { TenantMetrics } from '../components/tenant-metrics';
import { TenantInfoCards } from '../components/tenant-info-cards';
import { TenantRecentOrders } from '../components/tenant-recent-orders';

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: detail, isLoading, isError } = useTenantDetail(id!);
  const back = <Link to="/admin/stores" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="size-4" /> All stores</Link>;

  if (isLoading) return <div className="flex flex-col gap-4">{back}<Skeleton className="h-96 w-full rounded-2xl" /></div>;
  if (isError || !detail) return <div className="flex flex-col gap-4">{back}<p className="text-slate-500">Store not found.</p></div>;
  const { tenant } = detail;

  return (
    <div className="flex flex-col gap-6">
      {back}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {detail.store?.logo_url ? <img src={detail.store.logo_url} alt="" className="size-14 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200" /> : <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600">{tenant.name.charAt(0).toUpperCase()}</span>}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><h1 className="truncate font-heading text-2xl font-bold tracking-tight text-slate-900">{tenant.name}</h1><StatusBadge tone={getTenantStatusTone(tenant.status)} value={tenant.status} /></div>
            <p className="text-sm text-slate-500">Created {formatOrderDate(tenant.created_at)}{detail.activity.last_order_at && ` · Last order ${formatOrderDate(detail.activity.last_order_at)}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/${tenant.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-700">Visit store <ExternalLink className="size-3.5" /></a>
          <TenantAction tenant={{ ...tenant, is_published: Boolean(detail.store?.is_published), owner_email: detail.owner?.email ?? null, owner_username: detail.owner?.username ?? null }} />
        </div>
      </div>
      <TenantMetrics activity={detail.activity} />
      <TenantInfoCards detail={detail} />
      <TenantRecentOrders orders={detail.activity.recent_orders} />
    </div>
  );
}
