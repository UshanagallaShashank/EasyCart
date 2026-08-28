import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/auth-context';
import { RequireAuth } from './require-auth';
import { DashboardLayout } from './dashboard-layout';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RegisterPage } from '@/features/auth/pages/register-page';
import { StoreSettingsPage } from '@/features/stores/pages/store-settings-page';
import { CategoriesPage } from '@/features/categories/pages/categories-page';
import { ProductsPage } from '@/features/products/pages/products-page';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="store" replace />} />
          <Route path="store" element={<StoreSettingsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
