// Blocks /rider/* routes unless logged in as a delivery partner.
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/shared/auth/auth-context';

export function RequireRider() {
  const { user } = useAuth();
  if (!user || user.role !== 'delivery_partner') return <Navigate to="/login" replace />;
  return <Outlet />;
}
