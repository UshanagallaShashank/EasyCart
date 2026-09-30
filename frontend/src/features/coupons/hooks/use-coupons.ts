import { useQuery } from '@tanstack/react-query';
import { listCoupons } from '../api/coupon-api';

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => (await listCoupons()).coupons
  });
}
