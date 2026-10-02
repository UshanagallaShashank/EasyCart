// Queries and mutations for the rider app. The home screen refreshes every 15 seconds so new offers appear on their own.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/features/delivery/api/rider-api';
import type { Rider } from '@/features/delivery/types/delivery-types';

export const riderKeys = {
  me: ['rider', 'me'] as const,
  home: ['rider', 'home'] as const,
  order: (id: string) => ['rider', 'order', id] as const,
  history: ['rider', 'history'] as const,
  earnings: ['rider', 'earnings'] as const,
  settlements: ['rider', 'settlements'] as const
};

export function useMyRider() {
  return useQuery({ queryKey: riderKeys.me, queryFn: async () => (await api.getMyRider()).rider });
}

export function useRiderHome(enabled = true) {
  return useQuery({ queryKey: riderKeys.home, queryFn: api.getRiderHome, enabled, refetchInterval: 15_000, refetchOnWindowFocus: true, staleTime: 5_000 });
}

export function useRiderOrder(id: string) {
  return useQuery({ queryKey: riderKeys.order(id), queryFn: async () => (await api.getRiderOrder(id)).order, refetchInterval: 20_000, staleTime: 5_000 });
}

export function useRiderHistory() {
  return useQuery({ queryKey: riderKeys.history, queryFn: async () => (await api.getRiderHistory()).orders });
}

export function useRiderEarnings() {
  return useQuery({
    queryKey: riderKeys.earnings,
    queryFn: api.getRiderEarnings,
    refetchInterval: 10_000,
    staleTime: 4_000,
    refetchOnWindowFocus: true
  });
}

export function useRiderSettlements() {
  return useQuery({
    queryKey: riderKeys.settlements,
    queryFn: api.getRiderSettlements,
    refetchInterval: 10_000,
    staleTime: 4_000,
    refetchOnWindowFocus: true
  });
}

export function useRiderPayStore(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { method?: string; note?: string }) => api.payStoreForOrder(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['store-settlements'] });
    }
  });
}

// Any change to the rider profile updates the cached profile right away.
export function useRiderProfileMutation<T>(run: (input: T) => Promise<{ rider: Rider }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: ({ rider }) => {
      queryClient.setQueryData(riderKeys.me, rider);
      queryClient.invalidateQueries({ queryKey: riderKeys.home });
    }
  });
}

// Delivery steps refresh everything the rider sees about their orders.
export function useRiderOrderMutation<T, R>(run: (input: T) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rider'] })
  });
}
