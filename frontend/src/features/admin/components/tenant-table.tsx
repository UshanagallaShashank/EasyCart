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

export function TenantTable() {
  const { data: tenants, isLoading } = useTenants();
  const suspend = useSuspendTenant();
  const reactivate = useReactivateTenant();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!tenants?.length) return <EmptyState message="No tenants yet." />;

  return (
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
              <p className="text-muted-foreground text-sm">/{tenant.slug}</p>
            </TableCell>
            <TableCell>
              <p>{tenant.owner_username ?? '—'}</p>
              <p className="text-muted-foreground text-sm">{tenant.owner_email ?? '—'}</p>
            </TableCell>
            <TableCell><Badge className={STATUS_TONE_CLASSNAME[getTenantStatusTone(tenant.status)]}>{tenant.status}</Badge></TableCell>
            <TableCell>{tenant.is_published ? 'Yes' : 'No'}</TableCell>
            <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              {tenant.status === 'active' ? (
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
              ) : (
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
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
