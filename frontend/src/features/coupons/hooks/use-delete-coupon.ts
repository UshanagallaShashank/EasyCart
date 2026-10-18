import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCoupon } from '../api/coupon-api';

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] })
  });
}
