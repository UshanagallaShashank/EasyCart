// Rider data and actions. Every change refreshes all rider screens.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, api } from '@/lib/api';
import type { DailyPoint, Rider, RiderHome, RiderMoney, RiderOrder, RiderSettlementSummary, Settlement } from '@/types/delivery';

export const useMyRider = () => useQuery({ queryKey: ['rider', 'me'], queryFn: async () => (await api<{ rider: Rider }>('/riders/me')).rider });
export const useRiderHome = (enabled: boolean) => useQuery({ queryKey: ['rider', 'home'], queryFn: () => api<RiderHome>('/riders/me/home'), enabled, refetchInterval: 10_000 });
// An order another rider took (or the store took back) comes back as "not found". That is a normal answer,
// so it shows as "no longer yours" straight away instead of being asked for again and again.
async function fetchRiderOrder(id: string): Promise<RiderOrder | null> {
  try {
    return (await api<{ order: RiderOrder }>(`/riders/me/orders/${id}`)).order;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export const useRiderOrder = (id: string) => useQuery({ queryKey: ['rider', 'order', id], queryFn: () => fetchRiderOrder(id) });
export const useRiderHistory = () => useQuery({ queryKey: ['rider', 'history'], queryFn: async () => (await api<{ orders: RiderOrder[] }>('/riders/me/history')).orders });
export const useRiderEarnings = () => useQuery({ queryKey: ['rider', 'earnings'], queryFn: () => api<{ summary: RiderMoney; daily: DailyPoint[]; settlements: Settlement[] }>('/riders/me/earnings') });
export const useRiderSettlements = () => useQuery({ queryKey: ['rider', 'settlements'], queryFn: () => api<RiderSettlementSummary>('/riders/me/settlements') });

export function useRiderAction<T, R>(run: (input: T) => Promise<R>) {
  const queryClient = useQueryClient();
  // Refreshes after a failure too, so an order another rider just took disappears at once.
  return useMutation({ mutationFn: run, onSettled: () => queryClient.invalidateQueries({ queryKey: ['rider'] }) });
}

export const riderCalls = {
  setOnline: (body: { is_online: boolean; latitude?: number; longitude?: number }) => api<{ rider: Rider }>('/riders/me/online', { method: 'PUT', body }),
  updateLocation: (body: { latitude: number; longitude: number }) => api('/riders/me/location', { method: 'PUT', body }),
  accept: (id: string) => api<{ order: RiderOrder }>(`/riders/me/orders/${id}/accept`, { method: 'POST' }),
  decline: (id: string) => api(`/riders/me/orders/${id}/decline`, { method: 'POST' }),
  drop: (id: string) => api(`/riders/me/orders/${id}/drop`, { method: 'POST' }),
  pickup: ({ id, code }: { id: string; code: string }) => api<{ order: RiderOrder }>(`/riders/me/orders/${id}/pickup`, { method: 'POST', body: { pickup_code: code } }),
  deliver: ({ id, ...body }: { id: string; delivery_code: string; cash_collected: number; photo: string }) => api<{ order: RiderOrder }>(`/riders/me/orders/${id}/deliver`, { method: 'POST', body }),
  payStore: ({ id, method, note }: { id: string; method: 'cash' | 'upi'; note?: string }) => api(`/riders/me/orders/${id}/pay-store`, { method: 'POST', body: { method, note } }),
  updateProfile: (body: Partial<Rider>) => api<{ rider: Rider }>('/riders/me', { method: 'PATCH', body }),
  setBaseLocation: (body: { latitude: number; longitude: number }) => api<{ rider: Rider }>('/riders/me/base-location', { method: 'PUT', body }),
  uploadDocument: (body: { kind: string; file: string; label?: string }) => api<{ rider: Rider }>('/riders/me/documents', { method: 'POST', body }),
  submit: () => api<{ rider: Rider }>('/riders/me/submit', { method: 'POST' })
};
