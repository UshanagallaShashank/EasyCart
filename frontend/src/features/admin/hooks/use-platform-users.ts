// Every user account on the platform, for the admin user directory.
import { useQuery } from '@tanstack/react-query';
import { listPlatformUsers } from '../api/admin-api';

export function usePlatformUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: async () => (await listPlatformUsers()).users });
}
