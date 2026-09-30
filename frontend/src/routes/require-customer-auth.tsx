// Blocks customer-only routes unless logged in as a customer; preserves the
// current path so login can redirect back here afterward.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';

export function RequireCustomerAuth() {
  const { user } = useCustomerAuth();
  const location = useLocation();
  if (!user) return <Navigate to={`/customer/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return <Outlet />;
}
