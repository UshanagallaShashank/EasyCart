import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setCouponActive } from '../api/coupon-api';

export function useSetCouponActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => setCouponActive(id, is_active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] })
  });
}
