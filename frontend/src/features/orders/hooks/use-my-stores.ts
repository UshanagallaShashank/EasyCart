import { useQuery } from '@tanstack/react-query';
import { getMyStores } from '../api/customer-order-api';

export function useMyStores() {
  return useQuery({
    queryKey: ['my-stores'],
    queryFn: async () => (await getMyStores()).stores
  });
}
