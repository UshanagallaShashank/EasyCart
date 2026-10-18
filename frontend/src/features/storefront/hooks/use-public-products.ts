import { useQuery } from '@tanstack/react-query';
import { listPublicProducts } from '../api/storefront-api';

export function usePublicProducts(slug: string, search?: string, categoryId?: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'products', search ?? '', categoryId ?? ''],
    queryFn: async () => (await listPublicProducts(slug, { search, category_id: categoryId })).products
  });
}
