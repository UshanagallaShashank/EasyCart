import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkSuspendTenants, bulkReactivateTenants } from '../api/admin-api';

export function useBulkSuspendTenants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkSuspendTenants(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    }
  });
}

export function useBulkReactivateTenants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkReactivateTenants(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    }
  });
}
