// Blocks /admin/* routes unless logged in as a platform admin.
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/shared/auth/auth-context';

export function RequireAdmin() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'platform_admin') return <Navigate to="/login" replace />;
  return <Outlet />;
}
