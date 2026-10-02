// Store-side delivery queries. An order's delivery refreshes every 15 seconds while a rider is being found or is on the way.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRidersNearby, getStoreDeliveries, getStoreOrderDelivery, getStoreSettlements, runStoreDeliveryAction, settleStoreOrderDelivery, type StoreAction } from '../api/handover-api';

const LIVE_STAGES = ['ready_for_delivery', 'rider_assigned', 'dispatched'];

export function useStoreOrderDelivery(orderId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['orders', orderId, 'delivery'],
    queryFn: async () => (await getStoreOrderDelivery(orderId)).delivery,
    enabled,
    refetchInterval: (query) => (LIVE_STAGES.includes(query.state.data?.stage ?? '') ? 15_000 : false),
    staleTime: 5_000
  });
}

export function useStoreDeliveryAction(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: StoreAction) => runStoreDeliveryAction(orderId, action),
    onSuccess: ({ delivery }) => {
      queryClient.setQueryData(['orders', orderId, 'delivery'], delivery);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-deliveries'] });
    }
  });
}

export function useRidersNearby() {
  return useQuery({ queryKey: ['riders-nearby'], queryFn: getRidersNearby, refetchInterval: 30_000 });
}

export function useStoreDeliveries() {
  return useQuery({ queryKey: ['store-deliveries'], queryFn: async () => (await getStoreDeliveries()).deliveries, refetchInterval: 20_000 });
}

export function useStoreSettlements() {
  return useQuery({ queryKey: ['store-settlements'], queryFn: getStoreSettlements, refetchInterval: 15_000 });
}

export function useSettleOrderDelivery(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { method?: string; note?: string }) => settleStoreOrderDelivery(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'delivery'] });
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['store-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['rider'] });
    }
  });
}
