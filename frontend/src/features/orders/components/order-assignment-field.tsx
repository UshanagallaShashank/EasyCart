import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateAssignment } from '../hooks/use-update-assignment';
import { ApiError } from '@/shared/api/api-error';
import type { Order } from '../types/order-types';

export function OrderAssignmentField({ order }: { order: Order }) {
  const [value, setValue] = useState(order.assigned_to ?? '');
  const updateAssignment = useUpdateAssignment();

  function handleBlur() {
    const trimmed = value.trim();
    if (trimmed === (order.assigned_to ?? '')) return;
    updateAssignment.mutate(
      { id: order.id, assigned_to: trimmed || null },
      { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to update assignment') }
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="assigned_to">Assigned to</Label>
      <Input
        id="assigned_to"
        className="w-40"
        placeholder="Unassigned"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
      />
    </div>
  );
}
