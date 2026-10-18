import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCoupon } from '../api/coupon-api';
import type { CouponPayload } from '../types/coupon-types';

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CouponPayload) => createCoupon(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] })
  });
}
