// Lazily loaded sign-in and sign-up pages for store owners, customers, and admins.
import { lazy_page } from './lazy-page';

export const LoginPage = lazy_page(() => import('@/features/auth/pages/login-page'), 'LoginPage');
export const RegisterPage = lazy_page(() => import('@/features/auth/pages/register-page'), 'RegisterPage');
export const AdminLoginPage = lazy_page(() => import('@/features/admin-auth/pages/admin-login-page'), 'AdminLoginPage');
export const AdminRegisterPage = lazy_page(() => import('@/features/admin-auth/pages/admin-register-page'), 'AdminRegisterPage');
export const CustomerLoginPage = lazy_page(() => import('@/features/customer-auth/pages/customer-login-page'), 'CustomerLoginPage');
export const CustomerRegisterPage = lazy_page(() => import('@/features/customer-auth/pages/customer-register-page'), 'CustomerRegisterPage');
