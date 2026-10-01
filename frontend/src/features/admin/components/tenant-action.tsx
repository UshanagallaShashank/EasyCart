// Suspend/reactivate or approve/reject store requests for platform admins.
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ApiError } from '@/shared/api/api-error';
import { useSuspendTenant } from '../hooks/use-suspend-tenant';
import { useReactivateTenant } from '../hooks/use-reactivate-tenant';
import { useApproveStoreRequest, useRejectStoreRequest } from '../hooks/use-store-requests';
import type { AdminTenant } from '../types/admin-types';

export function TenantAction({ tenant }: { tenant: AdminTenant }) {
  const suspend = useSuspendTenant();
  const reactivate = useReactivateTenant();
  const approve = useApproveStoreRequest();
  const reject = useRejectStoreRequest();
  const on_error = (fallback: string) => (err: Error) => toast.error(err instanceof ApiError ? err.message : fallback);

  if (tenant.status === 'pending') {
    return (
      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          disabled={approve.isPending || reject.isPending}
          onClick={() =>
            approve.mutate(tenant.id, {
              onSuccess: () => toast.success(`Store "${tenant.name}" approved and created!`),
              onError: on_error('Failed to approve store')
            })
          }
        >
          <Check className="size-3.5 mr-1" /> Approve
        </Button>
        <ConfirmDialog
          title={`Reject store request for "${tenant.name}"?`}
          description="The customer will be notified that their application was rejected. They can submit a new request later."
          confirmLabel="Reject request"
          onConfirm={() =>
            reject.mutate(tenant.id, {
              onSuccess: () => toast.success(`Store request for "${tenant.name}" rejected`),
              onError: on_error('Failed to reject store')
            })
          }
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              disabled={approve.isPending || reject.isPending}
            >
              <X className="size-3.5 mr-1" /> Reject
            </Button>
          }
        />
      </div>
    );
  }

  if (tenant.status === 'rejected') {
    return (
      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          disabled={approve.isPending}
          onClick={() =>
            approve.mutate(tenant.id, {
              onSuccess: () => toast.success(`Store "${tenant.name}" approved!`),
              onError: on_error('Failed to approve store')
            })
          }
        >
          <Check className="size-3.5 mr-1" /> Approve
        </Button>
      </div>
    );
  }

  if (tenant.status === 'suspended') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={reactivate.isPending}
        onClick={() =>
          reactivate.mutate(tenant.id, {
            onSuccess: () => toast.success(`${tenant.name} reactivated`),
            onError: on_error('Failed to reactivate store')
          })
        }
      >
        Reactivate
      </Button>
    );
  }

  return (
    <ConfirmDialog
      title={`Suspend ${tenant.name}?`}
      description="The owner loses dashboard access and the storefront goes offline until you reactivate it."
      confirmLabel="Suspend store"
      onConfirm={() =>
        suspend.mutate(tenant.id, {
          onSuccess: () => toast.success(`${tenant.name} suspended`),
          onError: on_error('Failed to suspend store')
        })
      }
      trigger={
        <Button variant="destructive" size="sm" disabled={suspend.isPending}>
          Suspend
        </Button>
      }
    />
  );
}
