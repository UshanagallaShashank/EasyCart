import { useQuery } from '@tanstack/react-query';
import { getOwnStore } from '../api/store-api';

export function useOwnStore() {
  return useQuery({
    queryKey: ['store'],
    queryFn: async () => (await getOwnStore()).store
  });
}
