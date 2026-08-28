import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginOwner } from '../api/auth-api';
import { useAuth } from '@/shared/auth/auth-context';
import type { LoginPayload } from '../types/auth-types';

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginOwner(payload),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/dashboard');
    }
  });
}
