import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderStatus } from '../api/order-api';
import type { Order } from '../types/order-types';

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) => updateOrderStatus(id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
    }
  });
}
