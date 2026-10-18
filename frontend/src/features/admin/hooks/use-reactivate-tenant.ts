import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactivateTenant } from '../api/admin-api';

export function useReactivateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateTenant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
  });
}
