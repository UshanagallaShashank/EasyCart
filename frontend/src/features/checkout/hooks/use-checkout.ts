import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { checkout } from '../api/checkout-api';
import { useCart } from '@/features/cart/cart-context';
import type { CheckoutPayload } from '../types/checkout-types';

export function useCheckout(slug: string) {
  const { clear } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => checkout(slug, payload),
    onSuccess: (data) => {
      clear();
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      navigate(`/${slug}/orders/${data.order.id}`);
    }
  });
}
