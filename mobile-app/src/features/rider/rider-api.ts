// Rider data and actions. Every change refreshes all rider screens.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DailyPoint, Rider, RiderHome, RiderMoney, RiderOrder, RiderSettlementSummary, Settlement } from '@/types/delivery';

export const useMyRider = () => useQuery({ queryKey: ['rider', 'me'], queryFn: async () => (await api<{ rider: Rider }>('/riders/me')).rider });
export const useRiderHome = (enabled: boolean) => useQuery({ queryKey: ['rider', 'home'], queryFn: () => api<RiderHome>('/riders/me/home'), enabled, refetchInterval: 30_000 });
export const useRiderOrder = (id: string) => useQuery({ queryKey: ['rider', 'order', id], queryFn: async () => (await api<{ order: RiderOrder }>(`/riders/me/orders/${id}`)).order });
export const useRiderHistory = () => useQuery({ queryKey: ['rider', 'history'], queryFn: async () => (await api<{ orders: RiderOrder[] }>('/riders/me/history')).orders });
export const useRiderEarnings = () => useQuery({ queryKey: ['rider', 'earnings'], queryFn: () => api<{ summary: RiderMoney; daily: DailyPoint[]; settlements: Settlement[] }>('/riders/me/earnings') });
export const useRiderSettlements = () => useQuery({ queryKey: ['rider', 'settlements'], queryFn: () => api<RiderSettlementSummary>('/riders/me/settlements') });

export function useRiderAction<T, R>(run: (input: T) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: run, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rider'] }) });
}

export const riderCalls = {
  setOnline: (body: { is_online: boolean; latitude?: number; longitude?: number }) => api<{ rider: Rider }>('/riders/me/online', { method: 'PUT', body }),
  updateLocation: (body: { latitude: number; longitude: number }) => api('/riders/me/location', { method: 'PUT', body }),
  accept: (id: string) => api<{ order: RiderOrder }>(`/riders/me/orders/${id}/accept`, { method: 'POST' }),
  decline: (id: string) => api(`/riders/me/orders/${id}/decline`, { method: 'POST' }),
  pickup: ({ id, code }: { id: string; code: string }) => api<{ order: RiderOrder }>(`/riders/me/orders/${id}/pickup`, { method: 'POST', body: { pickup_code: code } }),
  deliver: ({ id, ...body }: { id: string; delivery_code: string; cash_collected: number; photo: string }) => api<{ order: RiderOrder }>(`/riders/me/orders/${id}/deliver`, { method: 'POST', body }),
  payStore: ({ id, method, note }: { id: string; method: 'cash' | 'upi'; note?: string }) => api(`/riders/me/orders/${id}/pay-store`, { method: 'POST', body: { method, note } }),
  updateProfile: (body: Partial<Rider>) => api<{ rider: Rider }>('/riders/me', { method: 'PATCH', body }),
  setBaseLocation: (body: { latitude: number; longitude: number }) => api<{ rider: Rider }>('/riders/me/base-location', { method: 'PUT', body }),
  uploadDocument: (body: { kind: string; file: string; label?: string }) => api<{ rider: Rider }>('/riders/me/documents', { method: 'POST', body }),
  submit: () => api<{ rider: Rider }>('/riders/me/submit', { method: 'POST' })
};
