import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/auth-context';
import { RequireAuth } from './require-auth';
import { RequireAdmin } from './require-admin';
import { RequireCustomerAuth } from './require-customer-auth';
import { DashboardLayout } from './dashboard-layout';
import { AdminLayout } from './admin-layout';
import { StorefrontLayout } from './storefront-layout';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RegisterPage } from '@/features/auth/pages/register-page';
import { AdminRegisterPage } from '@/features/admin-auth/pages/admin-register-page';
import { AdminLoginPage } from '@/features/admin-auth/pages/admin-login-page';
import { StoreSettingsPage } from '@/features/stores/pages/store-settings-page';
import { CategoriesPage } from '@/features/categories/pages/categories-page';
import { ProductsPage } from '@/features/products/pages/products-page';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page';
import { CustomerLoginPage } from '@/features/customer-auth/pages/customer-login-page';
import { CustomerRegisterPage } from '@/features/customer-auth/pages/customer-register-page';
import { OverviewPage } from '@/features/dashboard/pages/overview-page';
import { CustomerOrdersPage } from '@/features/orders/pages/customer-orders-page';
import { CustomerOrderDetailPage } from '@/features/orders/pages/customer-order-detail-page';
import { StorefrontHomePage } from '@/features/storefront/pages/storefront-home-page';
import { StorefrontProductsPage } from '@/features/storefront/pages/storefront-products-page';
import { StorefrontProductDetailPage } from '@/features/storefront/pages/storefront-product-detail-page';
import { CartPage } from '@/features/cart/pages/cart-page';
import { CheckoutPage } from '@/features/checkout/pages/checkout-page';
import { TenantsPage } from '@/features/admin/pages/tenants-page';
import { AdminOverviewPage } from '@/features/admin/pages/admin-overview-page';
import { TenantDetailPage } from '@/features/admin/pages/tenant-detail-page';
import { UsersPage } from '@/features/admin/pages/users-page';
import { CustomersPage } from '@/features/tenant-customers/pages/customers-page';
import { CustomerDetailPage } from '@/features/tenant-customers/pages/customer-detail-page';
import { CouponsPage } from '@/features/coupons/pages/coupons-page';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'platform_admin' ? '/admin' : '/dashboard'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="store" element={<StoreSettingsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="coupons" element={<CouponsPage />} />
        </Route>
      </Route>

      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="stores" element={<TenantsPage />} />
          <Route path="stores/:id" element={<TenantDetailPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="/customer/login" element={<CustomerLoginPage />} />
      <Route path="/customer/register" element={<CustomerRegisterPage />} />
      <Route element={<RequireCustomerAuth />}>
        <Route path="/customer/orders" element={<CustomerOrdersPage />} />
        <Route path="/customer/orders/:id" element={<CustomerOrderDetailPage />} />
      </Route>

      <Route path="/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorefrontHomePage />} />
        <Route path="products" element={<StorefrontProductsPage />} />
        <Route path="products/:id" element={<StorefrontProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route element={<RequireCustomerAuth />}>
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
