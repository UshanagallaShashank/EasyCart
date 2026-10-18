import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '../api/product-api';
import type { ProductUpdatePayload } from '../types/product-types';

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdatePayload }) => updateProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
}
