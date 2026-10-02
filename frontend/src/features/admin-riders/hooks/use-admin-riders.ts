// Admin queries for delivery partners. Every review action returns the updated detail, which replaces the cache.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/features/delivery/api/admin-rider-api';
import type { AdminRiderDetail } from '@/features/delivery/types/delivery-types';

export function useAdminRiders(near: string | undefined) {
  return useQuery({ queryKey: ['admin', 'riders', near ?? ''], queryFn: () => api.listAdminRiders(near) });
}

export function useAdminRider(id: string) {
  return useQuery({ queryKey: ['admin', 'rider', id], queryFn: () => api.getAdminRider(id) });
}

export function useAdminDeliveries() {
  return useQuery({ queryKey: ['admin', 'deliveries'], queryFn: async () => (await api.listAdminDeliveries()).deliveries, refetchInterval: 30_000 });
}

export function useAdminRiderAction<T>(id: string, run: (input: T) => Promise<AdminRiderDetail>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: (detail) => {
      queryClient.setQueryData(['admin', 'rider', id], detail);
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    }
  });
}
