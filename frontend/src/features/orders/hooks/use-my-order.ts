import { useQuery } from '@tanstack/react-query';
import { getMyOrder } from '../api/customer-order-api';

export function useMyOrder(id: string) {
  return useQuery({
    queryKey: ['my-orders', id],
    queryFn: async () => (await getMyOrder(id)).order
  });
}
