import { useQuery } from '@tanstack/react-query';
import { getTenantCustomer } from '../api/tenant-customer-api';

export function useTenantCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => (await getTenantCustomer(id)).customer,
    enabled: !!id
  });
}
