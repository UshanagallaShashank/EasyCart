import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerOwner } from '../api/auth-api';
import { useAuth } from '@/shared/auth/auth-context';
import type { RegisterPayload } from '../types/auth-types';

export function useRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerOwner(payload),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/dashboard');
    }
  });
}
