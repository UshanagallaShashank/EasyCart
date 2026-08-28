import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustStock } from '../api/product-api';

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) => adjustStock(id, delta),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
}
