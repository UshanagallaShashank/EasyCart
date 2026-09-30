import { useQuery } from '@tanstack/react-query';
import { listTenantCustomers } from '../api/tenant-customer-api';

export function useTenantCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => (await listTenantCustomers()).customers
  });
}
