// Lazily loaded store owner dashboard pages.
import { lazy_page } from './lazy-page';

export const OverviewPage = lazy_page(() => import('@/features/dashboard/pages/overview-page'), 'OverviewPage');
export const StoreSettingsPage = lazy_page(() => import('@/features/stores/pages/store-settings-page'), 'StoreSettingsPage');
export const CategoriesPage = lazy_page(() => import('@/features/categories/pages/categories-page'), 'CategoriesPage');
export const ProductsPage = lazy_page(() => import('@/features/products/pages/products-page'), 'ProductsPage');
export const OrdersPage = lazy_page(() => import('@/features/orders/pages/orders-page'), 'OrdersPage');
export const OrderDetailPage = lazy_page(() => import('@/features/orders/pages/order-detail-page'), 'OrderDetailPage');
export const CustomersPage = lazy_page(() => import('@/features/tenant-customers/pages/customers-page'), 'CustomersPage');
export const CustomerDetailPage = lazy_page(() => import('@/features/tenant-customers/pages/customer-detail-page'), 'CustomerDetailPage');
export const CouponsPage = lazy_page(() => import('@/features/coupons/pages/coupons-page'), 'CouponsPage');
