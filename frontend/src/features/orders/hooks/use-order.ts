import { useQuery } from '@tanstack/react-query';
import { getOrder } from '../api/order-api';

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => (await getOrder(id)).order
  });
}
