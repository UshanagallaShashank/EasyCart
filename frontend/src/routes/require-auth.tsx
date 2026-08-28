// Blocks /dashboard/* routes unless logged in as a tenant owner.
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/shared/auth/auth-context';

export function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
