// Settling one delivered cash order: the store marks the cash received, or the rider marks it handed over.
// Both end in the same state, so one hook serves both sides.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settleStoreOrderDelivery } from '../api/handover-api';
import { payStoreForOrder } from '../api/rider-api';

export type SettleSide = 'store' | 'rider';
export interface SettleInput { orderId: string; method: 'cash' | 'upi'; note?: string }

export function useSettle(side: SettleSide) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, method, note }: SettleInput) => (side === 'store' ? settleStoreOrderDelivery : payStoreForOrder)(orderId, { method, note }),
    onSuccess: () => {
      for (const key of [['orders'], ['store-settlements'], ['store-deliveries'], ['rider']]) queryClient.invalidateQueries({ queryKey: key });
    }
  });
}
