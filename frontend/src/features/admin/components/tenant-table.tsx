import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { getTenantStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useTenants } from '../hooks/use-tenants';
import { useSuspendTenant } from '../hooks/use-suspend-tenant';
import { useReactivateTenant } from '../hooks/use-reactivate-tenant';
import { ApiError } from '@/shared/api/api-error';
import type { AdminTenant } from '../types/admin-types';

// The suspend / reactivate button, shared by the phone cards and the table.
function TenantAction({ tenant }: { tenant: AdminTenant }) {
  const suspend = useSuspendTenant();
  const reactivate = useReactivateTenant();

  if (tenant.status === 'active') {
    return (
      <Button
        variant="destructive"
        size="sm"
        disabled={suspend.isPending}
        onClick={() =>
          suspend.mutate(tenant.id, {
            onSuccess: () => toast.success(`${tenant.name} suspended`),
            onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to suspend tenant')
          })
        }
      >
        Suspend
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={reactivate.isPending}
      onClick={() =>
        reactivate.mutate(tenant.id, {
          onSuccess: () => toast.success(`${tenant.name} reactivated`),
          onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to reactivate tenant')
        })
      }
    >
      Reactivate
    </Button>
  );
}

export function TenantTable() {
  const { data: tenants, isLoading } = useTenants();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!tenants?.length) return <EmptyState message="No tenants yet." />;

  return (
    <>
      {/* Phones: one card per store */}
      <ul className="flex flex-col gap-3 md:hidden">
        {tenants.map((tenant) => (
          <li key={tenant.id} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{tenant.name}</p>
                <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
              </div>
              <Badge className={STATUS_TONE_CLASSNAME[getTenantStatusTone(tenant.status)]}>{tenant.status}</Badge>
            </div>
            <p className="mt-2 truncate text-sm">{tenant.owner_username ?? '—'}</p>
            <p className="truncate text-xs text-muted-foreground">{tenant.owner_email ?? '—'}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {tenant.is_published ? 'Published' : 'Not published'} · Created {new Date(tenant.created_at).toLocaleDateString()}
            </p>
            <div className="mt-3">
              <TenantAction tenant={tenant} />
            </div>
          </li>
        ))}
      </ul>

      {/* Tablets and larger: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id} className="hover:bg-secondary/30">
                <TableCell>
                  <p className="font-medium">{tenant.name}</p>
                  <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                </TableCell>
                <TableCell>
                  <p>{tenant.owner_username ?? '—'}</p>
                  <p className="text-sm text-muted-foreground">{tenant.owner_email ?? '—'}</p>
                </TableCell>
                <TableCell><Badge className={STATUS_TONE_CLASSNAME[getTenantStatusTone(tenant.status)]}>{tenant.status}</Badge></TableCell>
                <TableCell>{tenant.is_published ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <TenantAction tenant={tenant} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
