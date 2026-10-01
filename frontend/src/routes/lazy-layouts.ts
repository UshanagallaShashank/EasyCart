// Lazily loaded app shells, so each area's frame and its libraries download only when that area is opened.
import { lazy_page } from './lazy-page';

export const DashboardLayout = lazy_page(() => import('./dashboard-layout'), 'DashboardLayout');
export const AdminLayout = lazy_page(() => import('./admin-layout'), 'AdminLayout');
export const StorefrontLayout = lazy_page(() => import('./storefront-layout'), 'StorefrontLayout');
