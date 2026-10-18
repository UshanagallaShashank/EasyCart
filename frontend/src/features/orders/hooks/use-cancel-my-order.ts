import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelMyOrder } from '../api/customer-order-api';

export function useCancelMyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelMyOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    }
  });
}
