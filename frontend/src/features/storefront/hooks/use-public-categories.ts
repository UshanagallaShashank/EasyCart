import { useQuery } from '@tanstack/react-query';
import { listPublicCategories } from '../api/storefront-api';

export function usePublicCategories(slug: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'categories'],
    queryFn: async () => (await listPublicCategories(slug)).categories
  });
}
