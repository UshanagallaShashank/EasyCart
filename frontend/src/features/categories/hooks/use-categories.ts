import { useQuery } from '@tanstack/react-query';
import { listCategories } from '../api/category-api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await listCategories()).categories
  });
}
