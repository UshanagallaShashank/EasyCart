// Loads one store's admin detail; shares the tenants cache key so suspend/reactivate refresh it.
import { useQuery } from '@tanstack/react-query';
import { getTenantDetail } from '../api/admin-api';

export function useTenantDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'tenants', id],
    queryFn: () => getTenantDetail(id)
  });
}
