// Blocks customer-only routes unless logged in as a customer; preserves the
// current path so login can redirect back here afterward.
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { customerLoginPath } from '@/features/storefront/lib/customer-paths';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';

export function RequireCustomerAuth() {
  const { user } = useCustomerAuth();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  if (!user) return <Navigate to={customerLoginPath(slug!, location.pathname)} replace />;
  return <Outlet />;
}
