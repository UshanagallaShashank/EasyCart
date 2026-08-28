import { useQuery } from '@tanstack/react-query';
import { listProducts } from '../api/product-api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => (await listProducts()).products
  });
}
