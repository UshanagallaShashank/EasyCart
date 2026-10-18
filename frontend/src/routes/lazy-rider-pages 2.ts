// Lazily loaded delivery partner pages.
import { lazy_page } from './lazy-page';

export const RiderRegisterPage = lazy_page(() => import('@/features/rider/pages/rider-register-page'), 'RiderRegisterPage');
export const RiderOnboardingPage = lazy_page(() => import('@/features/rider/pages/rider-onboarding-page'), 'RiderOnboardingPage');
export const RiderHomePage = lazy_page(() => import('@/features/rider/pages/rider-home-page'), 'RiderHomePage');
export const RiderOrderPage = lazy_page(() => import('@/features/rider/pages/rider-order-page'), 'RiderOrderPage');
export const RiderHistoryPage = lazy_page(() => import('@/features/rider/pages/rider-history-page'), 'RiderHistoryPage');
export const RiderEarningsPage = lazy_page(() => import('@/features/rider/pages/rider-earnings-page'), 'RiderEarningsPage');
export const RiderProfilePage = lazy_page(() => import('@/features/rider/pages/rider-profile-page'), 'RiderProfilePage');
