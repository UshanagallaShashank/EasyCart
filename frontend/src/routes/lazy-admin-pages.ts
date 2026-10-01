// Lazily loaded platform admin pages.
import { lazy_page } from './lazy-page';

export const AdminOverviewPage = lazy_page(() => import('@/features/admin/pages/admin-overview-page'), 'AdminOverviewPage');
export const TenantsPage = lazy_page(() => import('@/features/admin/pages/tenants-page'), 'TenantsPage');
export const TenantDetailPage = lazy_page(() => import('@/features/admin/pages/tenant-detail-page'), 'TenantDetailPage');
export const UsersPage = lazy_page(() => import('@/features/admin/pages/users-page'), 'UsersPage');
export const SalesInsightsPage = lazy_page(() => import('@/features/admin/pages/sales-insights-page'), 'SalesInsightsPage');
export const GrowthInsightsPage = lazy_page(() => import('@/features/admin/pages/growth-insights-page'), 'GrowthInsightsPage');
export const AdminAccountPage = lazy_page(() => import('@/features/admin/pages/admin-account-page'), 'AdminAccountPage');
