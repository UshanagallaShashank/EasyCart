// Creates a platform admin account, signs the new admin in, and opens the admin console.
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerAdmin } from '../api/auth-api';
import { useAuth } from '@/shared/auth/auth-context';
import type { AdminRegisterPayload } from '../types/auth-types';

export function useAdminRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: AdminRegisterPayload) => registerAdmin(payload),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/admin');
    }
  });
}
