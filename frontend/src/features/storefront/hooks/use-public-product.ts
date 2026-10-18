import { useQuery } from '@tanstack/react-query';
import { getPublicProduct } from '../api/storefront-api';

export function usePublicProduct(slug: string, id: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'products', id],
    queryFn: async () => (await getPublicProduct(slug, id)).product
  });
}
