// Platform-wide totals, 30-day daily sales, and top stores; refreshed with the tenants cache.
import { useQuery } from '@tanstack/react-query';
import { getPlatformStats } from '../api/admin-api';

export function usePlatformStats() {
  return useQuery({ queryKey: ['admin', 'tenants', 'stats'], queryFn: getPlatformStats });
}
