import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyStoreRequest, requestStoreCreation, type CustomerStoreRequestPayload } from '../api/customer-store-request-api';

export function useMyStoreRequest() {
  return useQuery({
    queryKey: ['customer', 'store-request'],
    queryFn: async () => (await getMyStoreRequest()).request
  });
}

export function useSubmitStoreRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerStoreRequestPayload) => requestStoreCreation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'store-request'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'store-requests'] });
    }
  });
}
