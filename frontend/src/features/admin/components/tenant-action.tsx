// Suspend (with confirmation) or reactivate button for one store.
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ApiError } from '@/shared/api/api-error';
import { useSuspendTenant } from '../hooks/use-suspend-tenant';
import { useReactivateTenant } from '../hooks/use-reactivate-tenant';
import type { AdminTenant } from '../types/admin-types';

export function TenantAction({ tenant }: { tenant: AdminTenant }) {
  const suspend = useSuspendTenant();
  const reactivate = useReactivateTenant();
  const on_error = (fallback: string) => (err: Error) => toast.error(err instanceof ApiError ? err.message : fallback);

  if (tenant.status === 'suspended') {
    return (
      <Button variant="outline" size="sm" disabled={reactivate.isPending} onClick={() => reactivate.mutate(tenant.id, { onSuccess: () => toast.success(`${tenant.name} reactivated`), onError: on_error('Failed to reactivate store') })}>
        Reactivate
      </Button>
    );
  }

  return (
    <ConfirmDialog
      title={`Suspend ${tenant.name}?`}
      description="The owner loses dashboard access and the storefront goes offline until you reactivate it."
      confirmLabel="Suspend store"
      onConfirm={() => suspend.mutate(tenant.id, { onSuccess: () => toast.success(`${tenant.name} suspended`), onError: on_error('Failed to suspend store') })}
      trigger={<Button variant="destructive" size="sm" disabled={suspend.isPending}>Suspend</Button>}
    />
  );
}
