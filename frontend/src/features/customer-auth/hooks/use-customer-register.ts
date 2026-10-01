import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { registerCustomer } from '../api/customer-auth-api';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import type { CustomerRegisterPayload } from '../types/customer-auth-types';

export function useCustomerRegister() {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return useMutation({
    mutationFn: (payload: CustomerRegisterPayload) => registerCustomer(payload),
    onSuccess: (data) => {
      login(data.user, data.token);
      const lastSlug = sessionStorage.getItem('last_store_slug');
      const fallback = lastSlug ? `/${lastSlug}/orders` : '/customer/orders';
      navigate(searchParams.get('redirect') ?? fallback);
    }
  });
}
