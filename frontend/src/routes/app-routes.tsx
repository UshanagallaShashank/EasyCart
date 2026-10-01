import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoading } from '@/components/page-loading';
import { useAuth } from '@/shared/auth/auth-context';
import { RequireAuth } from './require-auth';
import { RequireAdmin } from './require-admin';
import { RequireCustomerAuth } from './require-customer-auth';
import { DashboardLayout, AdminLayout, StorefrontLayout } from './lazy-layouts';
import { LoginPage, RegisterPage, AdminLoginPage, AdminRegisterPage, CustomerLoginPage, CustomerRegisterPage } from './lazy-auth-pages';
import { OverviewPage, StoreSettingsPage, CategoriesPage, ProductsPage, OrdersPage, OrderDetailPage, CustomersPage, CustomerDetailPage, CouponsPage } from './lazy-dashboard-pages';
import { AdminOverviewPage, TenantsPage, TenantDetailPage, UsersPage, SalesInsightsPage, GrowthInsightsPage, AdminAccountPage } from './lazy-admin-pages';
import { StorefrontHomePage, StorefrontProductsPage, StorefrontProductDetailPage, StorefrontAddressPage, CartPage, CheckoutPage, CustomerOrdersPage, CustomerOrderDetailPage, CustomerStoreRequestPage } from './lazy-shop-pages';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'platform_admin' ? '/admin' : '/dashboard'} replace />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
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
          <Route path="insights/sales" element={<SalesInsightsPage />} />
          <Route path="insights/growth" element={<GrowthInsightsPage />} />
          <Route path="account" element={<AdminAccountPage />} />
        </Route>
      </Route>

      <Route path="/customer/login" element={<CustomerLoginPage />} />
      <Route path="/customer/register" element={<CustomerRegisterPage />} />
      <Route element={<RequireCustomerAuth />}>
        <Route path="/customer/orders" element={<CustomerOrdersPage />} />
        <Route path="/customer/orders/:id" element={<CustomerOrderDetailPage />} />
        <Route path="/customer/store-request" element={<CustomerStoreRequestPage />} />
      </Route>

      <Route path="/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorefrontHomePage />} />
        <Route path="products" element={<StorefrontProductsPage />} />
        <Route path="products/:id" element={<StorefrontProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="address" element={<StorefrontAddressPage />} />
        <Route element={<RequireCustomerAuth />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="orders/:id" element={<CustomerOrderDetailPage />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  );
}
