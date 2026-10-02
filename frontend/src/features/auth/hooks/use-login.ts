// Signs anyone in, then sends them to the right place for their role:
// customers to the storefront, store owners to the dashboard, platform admins to the admin console.
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getLastStoreSlug } from '@/features/storefront/lib/customer-paths';
import { loginOwner } from '../api/auth-api';
import { getHomeForRole } from '../lib/home-for-role';
import { useAuth } from '@/shared/auth/auth-context';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import type { LoginPayload } from '../types/auth-types';

export function useLogin() {
  const { login: loginStaff } = useAuth();
  const { login: loginCustomer } = useCustomerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Signing in from a shop's page (/<shop>/customer/login) keeps the customer in that shop.
  const { slug } = useParams<{ slug: string }>();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginOwner(payload),
    onSuccess: ({ user, token }) => {
      // Owners/admins and customers keep separate sign-in sessions, so save to the right one.
      if (user.role === 'customer') loginCustomer(user, token);
      else loginStaff(user, token);

      navigate(getHomeForRole(user.role, searchParams.get('redirect'), slug ?? getLastStoreSlug()));
    }
  });
}
