// Platform admin data and actions.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminDeliveryRow, AdminRiderDetail, AdminRiderList } from '@/types/delivery';

export interface PlatformTotals { stores: number; active_stores: number; owners: number; customers: number; admins?: number; orders: number; pending_orders: number; gmv: number }
export interface DailyRevenue { date: string; revenue: number; orders: number }
export interface AdminTenant { id: string; name: string; slug: string; status: 'active' | 'suspended' | 'pending' | 'rejected'; is_published: boolean; owner_email: string | null; owner_username?: string | null; customer_count?: number; revenue?: number; created_at: string }

export const useStats = () => useQuery({ queryKey: ['admin', 'stats'], queryFn: () => api<{ totals: PlatformTotals; daily_revenue?: DailyRevenue[]; top_stores: { tenant_id: string; name: string; revenue: number; orders: number }[] }>('/admin/stats') });
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

// ---- Store requests and store details (what the website's Stores pages show) ----

export interface StoreDocument { id: string; title: string; file_name: string; url: string; type: string }

export interface TenantDetail {
  tenant: { id: string; name: string; slug: string; status: AdminTenant['status']; created_at: string };
  store: { name: string; is_published: boolean; delivery_fee: number; promotion_banner_text: string | null } | null;
  owner: { username: string; email: string; phone_number: string } | null;
  business_address?: string | null;
  id_proof_url?: string | null;
  business_proof_url?: string | null;
  documents?: StoreDocument[];
  verification?: { business_address: string | null; id_proof_url: string | null; business_proof_url: string | null; documents: StoreDocument[] } | null;
  activity: { product_count: number; order_count: number; pending_order_count: number; revenue: number; customer_count: number; low_stock_count: number; last_order_at: string | null };
}

export const useTenantDetail = (id: string) => useQuery({ queryKey: ['admin', 'tenant', id], queryFn: () => api<TenantDetail>(`/admin/tenants/${id}`) });

// The applicant's address and the two documents, wherever the backend put them.
export function verificationOf(detail: TenantDetail) {
  const v = detail.verification;
  return {
    address: v?.business_address ?? detail.business_address ?? null,
    idProofUrl: v?.id_proof_url ?? detail.id_proof_url ?? null,
    businessProofUrl: v?.business_proof_url ?? detail.business_proof_url ?? null,
    documents: v?.documents ?? detail.documents ?? []
  };
}

export interface PlatformUser {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  role: 'tenant_owner' | 'customer' | 'delivery_partner' | 'platform_admin';
  created_at: string;
  store: { id: string; name: string; slug: string; status?: string } | null;
}

export const useUsers = () => useQuery({ queryKey: ['admin', 'users'], queryFn: async () => (await api<{ users: PlatformUser[] }>('/admin/users')).users });

export const requestCalls = {
  approve: (id: string) => api(`/admin/store-requests/${id}/approve`, { method: 'POST' }),
  reject: (id: string) => api(`/admin/store-requests/${id}/reject`, { method: 'POST' })
};
