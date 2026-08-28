import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderPaymentStatus } from '../api/order-api';
import type { Order } from '../types/order-types';

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payment_status }: { id: string; payment_status: Order['payment_status'] }) =>
      updateOrderPaymentStatus(id, payment_status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
    }
  });
}
