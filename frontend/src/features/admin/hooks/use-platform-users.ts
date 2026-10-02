// Every user account on the platform, for the admin user directory.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPlatformUsers, getPlatformUser, updatePlatformUser } from '../api/admin-api';
import type { UpdatePlatformUserPayload } from '../types/admin-types';
import { toast } from 'sonner';

export function usePlatformUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: async () => (await listPlatformUsers()).users });
}

export function usePlatformUser(id: string | null | undefined) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      if (!id) return null;
      return (await getPlatformUser(id)).user;
    },
    enabled: !!id
  });
}

export function useUpdatePlatformUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdatePlatformUserPayload }) => {
      return await updatePlatformUser(id, updates);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(data.message || 'User updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update user');
    }
  });
}
