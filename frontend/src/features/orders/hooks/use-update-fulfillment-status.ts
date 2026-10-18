import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderFulfillmentStatus } from '../api/order-api';
import type { Order } from '../types/order-types';

export function useUpdateFulfillmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fulfillment_status }: { id: string; fulfillment_status: Order['fulfillment_status'] }) =>
      updateOrderFulfillmentStatus(id, fulfillment_status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
    }
  });
}
