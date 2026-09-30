import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '../api/customer-order-api';

export function useMyOrders() {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await getMyOrders()).orders
  });
}
