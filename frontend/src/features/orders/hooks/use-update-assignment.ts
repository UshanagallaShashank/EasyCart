import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderAssignment } from '../api/order-api';

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigned_to }: { id: string; assigned_to: string | null }) => updateOrderAssignment(id, assigned_to),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
    }
  });
}
