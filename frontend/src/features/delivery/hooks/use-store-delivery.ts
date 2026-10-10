// Store-side delivery queries. An order's delivery refreshes every 15 seconds while a rider is being found or is on the way.
import { BACKUP_REFRESH_MS } from '@/lib/query-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRidersNearby, getStoreDeliveries, getStoreOrderDelivery, getStoreSettlements, runStoreDeliveryAction, type StoreAction } from '../api/handover-api';

const LIVE_STAGES = ['ready_for_delivery', 'rider_assigned', 'dispatched'];

export function useStoreOrderDelivery(orderId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['orders', orderId, 'delivery'],
    queryFn: async () => (await getStoreOrderDelivery(orderId)).delivery,
    enabled,
    refetchInterval: (query) => (LIVE_STAGES.includes(query.state.data?.stage ?? '') ? BACKUP_REFRESH_MS : false)
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
  return useQuery({ queryKey: ['riders-nearby'], queryFn: getRidersNearby, refetchInterval: BACKUP_REFRESH_MS });
}

export function useStoreDeliveries() {
  return useQuery({ queryKey: ['store-deliveries'], queryFn: async () => (await getStoreDeliveries()).deliveries, refetchInterval: BACKUP_REFRESH_MS });
}

export function useStoreSettlements() {
  return useQuery({ queryKey: ['store-settlements'], queryFn: getStoreSettlements, refetchInterval: BACKUP_REFRESH_MS });
}
