import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishStore, unpublishStore } from '../api/store-api';

export function usePublishStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store'] })
  });
}

export function useUnpublishStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unpublishStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store'] })
  });
}
