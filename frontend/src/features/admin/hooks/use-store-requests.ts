import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listStoreRequests, approveStoreRequest, rejectStoreRequest } from '../api/admin-api';

export function useStoreRequests() {
  return useQuery({
    queryKey: ['admin', 'store-requests'],
    queryFn: async () => (await listStoreRequests()).requests
  });
}

export function useApproveStoreRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveStoreRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    }
  });
}

export function useRejectStoreRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectStoreRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    }
  });
}
