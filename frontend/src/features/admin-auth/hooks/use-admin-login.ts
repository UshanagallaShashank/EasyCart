// Signs in a platform admin (non-admin accounts are refused) and opens the admin console.
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/auth-context';
import type { LoginPayload } from '@/features/auth/types/auth-types';
import { loginAdmin } from '../api/admin-auth-api';

export function useAdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginAdmin(payload),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/admin');
    }
  });
}
