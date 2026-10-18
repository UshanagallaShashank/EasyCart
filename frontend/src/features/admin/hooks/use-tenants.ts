import { useQuery } from '@tanstack/react-query';
import { listTenants } from '../api/admin-api';

export function useTenants() {
  return useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: async () => (await listTenants()).tenants
  });
}
