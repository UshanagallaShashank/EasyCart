// Lazily loaded sign-in and sign-up pages for store owners, customers, and admins.
import { lazy_page } from './lazy-page';

export const LoginPage = lazy_page(() => import('@/features/auth/pages/login-page'), 'LoginPage');
export const CustomerLoginPage = lazy_page(() => import('@/features/customer-auth/pages/customer-login-page'), 'CustomerLoginPage');
export const CustomerRegisterPage = lazy_page(() => import('@/features/customer-auth/pages/customer-register-page'), 'CustomerRegisterPage');
