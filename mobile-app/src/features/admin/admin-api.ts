// Platform admin data and actions.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminDeliveryRow, AdminRiderDetail, AdminRiderList } from '@/types/delivery';

export interface PlatformTotals { stores: number; active_stores: number; owners: number; customers: number; orders: number; pending_orders: number; gmv: number }
export interface AdminTenant { id: string; name: string; slug: string; status: 'active' | 'suspended' | 'pending' | 'rejected'; is_published: boolean; owner_email: string | null; created_at: string }

export const useStats = () => useQuery({ queryKey: ['admin', 'stats'], queryFn: () => api<{ totals: PlatformTotals; top_stores: { tenant_id: string; name: string; revenue: number; orders: number }[] }>('/admin/stats') });
export const useTenants = () => useQuery({ queryKey: ['admin', 'tenants'], queryFn: async () => (await api<{ tenants: AdminTenant[] }>('/admin/tenants')).tenants });
export const useRiders = () => useQuery({ queryKey: ['admin', 'riders'], queryFn: () => api<AdminRiderList>('/admin/riders') });
export const useRider = (id: string) => useQuery({ queryKey: ['admin', 'rider', id], queryFn: () => api<AdminRiderDetail>(`/admin/riders/${id}`) });
export const useDeliveries = () => useQuery({ queryKey: ['admin', 'deliveries'], queryFn: async () => (await api<{ deliveries: AdminDeliveryRow[] }>('/admin/deliveries')).deliveries });

export function useAdminAction<T, R>(run: (input: T) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: run, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }) });
}

export const adminCalls = {
  riderAction: ({ id, action, note }: { id: string; action: 'approve' | 'reject' | 'suspend' | 'reactivate'; note?: string }) => api<AdminRiderDetail>(`/admin/riders/${id}/${action}`, { method: 'POST', body: note ? { note } : {} }),
  tenantAction: ({ id, action }: { id: string; action: 'suspend' | 'reactivate' }) => api(`/admin/tenants/${id}/${action}`, { method: 'POST' })
};
