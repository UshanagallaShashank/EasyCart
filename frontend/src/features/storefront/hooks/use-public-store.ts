import { useQuery } from '@tanstack/react-query';
import { getPublicStore } from '../api/storefront-api';

export function usePublicStore(slug: string) {
  return useQuery({
    queryKey: ['storefront', slug],
    queryFn: async () => (await getPublicStore(slug)).store
  });
}
