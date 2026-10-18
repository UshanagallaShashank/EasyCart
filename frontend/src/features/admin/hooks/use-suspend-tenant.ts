import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suspendTenant } from '../api/admin-api';

export function useSuspendTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendTenant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
  });
}
