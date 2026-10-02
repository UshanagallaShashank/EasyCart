import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoading } from '@/components/page-loading';
import { useAuth } from '@/shared/auth/auth-context';
import { RequireAuth } from './require-auth';
import { RequireAdmin } from './require-admin';
import { RequireCustomerAuth } from './require-customer-auth';
import { DashboardLayout, AdminLayout, StorefrontLayout } from './lazy-layouts';
import { LoginPage, CustomerLoginPage, CustomerRegisterPage } from './lazy-auth-pages';
import { OverviewPage, StoreSettingsPage, CategoriesPage, ProductsPage, OrdersPage, OrderDetailPage, CustomersPage, CustomerDetailPage, CouponsPage } from './lazy-dashboard-pages';
import { AdminOverviewPage, TenantsPage, TenantDetailPage, UsersPage, SalesInsightsPage, GrowthInsightsPage, AdminAccountPage } from './lazy-admin-pages';
import { LegacyShopRedirect, BareCustomerRedirect } from './legacy-redirects';
import { CustomerHomePage } from './customer-home-page';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import { getLastStoreSlug, customerOrdersPath } from '@/features/storefront/lib/customer-paths';
import { StorefrontHomePage, StorefrontProductsPage, StorefrontProductDetailPage, StorefrontAddressPage, CartPage, CheckoutPage, CustomerOrdersPage, CustomerOrderDetailPage, CustomerStoreRequestPage } from './lazy-shop-pages';

function HomeRedirect() {
  const { user } = useAuth();
  const { user: customer } = useCustomerAuth();
  const lastSlug = getLastStoreSlug();

  if (!user && customer && lastSlug) return <Navigate to={customerOrdersPath(lastSlug)} replace />;
  if (!user && customer) return <CustomerHomePage />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'platform_admin' ? '/admin' : '/dashboard'} replace />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<CustomerRegisterPage />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/admin/register" element={<Navigate to="/register?admin=1" replace />} />
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

      {/* Customer pages always sit under their shop's address: /<shop>/customer/... */}
      <Route path="/:slug/customer/login" element={<CustomerLoginPage />} />
      <Route path="/:slug/customer/register" element={<CustomerRegisterPage />} />
      {/* Old addresses with no shop in them forward to the last shop visited. */}
      {/* Each is spelled out, because "/customer/orders" would otherwise be read as a shop called "customer". */}
      <Route path="/customer/login" element={<BareCustomerRedirect />} />
      <Route path="/customer/register" element={<BareCustomerRedirect />} />
      <Route path="/customer/orders" element={<BareCustomerRedirect />} />
      <Route path="/customer/orders/:id" element={<BareCustomerRedirect />} />
      <Route path="/customer/store-request" element={<BareCustomerRedirect />} />

      <Route path="/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorefrontHomePage />} />
        <Route path="products" element={<StorefrontProductsPage />} />
        <Route path="products/:id" element={<StorefrontProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="address" element={<StorefrontAddressPage />} />
        <Route path="orders" element={<LegacyShopRedirect />} />
        <Route path="orders/:id" element={<LegacyShopRedirect />} />
        <Route path="store-request" element={<LegacyShopRedirect />} />
        <Route element={<RequireCustomerAuth />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="customer/orders" element={<CustomerOrdersPage />} />
          <Route path="customer/orders/:id" element={<CustomerOrderDetailPage />} />
          <Route path="customer/store-request" element={<CustomerStoreRequestPage />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  );
}
