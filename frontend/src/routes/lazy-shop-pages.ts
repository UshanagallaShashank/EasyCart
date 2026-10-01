// Lazily loaded customer-facing pages: storefront, cart, checkout, and order history.
import { lazy_page } from './lazy-page';

export const StorefrontHomePage = lazy_page(() => import('@/features/storefront/pages/storefront-home-page'), 'StorefrontHomePage');
export const StorefrontProductsPage = lazy_page(() => import('@/features/storefront/pages/storefront-products-page'), 'StorefrontProductsPage');
export const StorefrontProductDetailPage = lazy_page(() => import('@/features/storefront/pages/storefront-product-detail-page'), 'StorefrontProductDetailPage');
export const CartPage = lazy_page(() => import('@/features/cart/pages/cart-page'), 'CartPage');
export const CheckoutPage = lazy_page(() => import('@/features/checkout/pages/checkout-page'), 'CheckoutPage');
export const CustomerOrdersPage = lazy_page(() => import('@/features/orders/pages/customer-orders-page'), 'CustomerOrdersPage');
export const CustomerOrderDetailPage = lazy_page(() => import('@/features/orders/pages/customer-order-detail-page'), 'CustomerOrderDetailPage');
