import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginCustomer } from '../api/customer-auth-api';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import type { CustomerLoginPayload } from '../types/customer-auth-types';

export function useCustomerLogin() {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return useMutation({
    mutationFn: (payload: CustomerLoginPayload) => loginCustomer(payload),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate(searchParams.get('redirect') ?? '/customer/orders');
    }
  });
}
