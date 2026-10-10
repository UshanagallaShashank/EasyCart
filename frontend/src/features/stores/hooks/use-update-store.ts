import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStoreSettings } from '../api/store-api';

export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store'] })
  });
}
