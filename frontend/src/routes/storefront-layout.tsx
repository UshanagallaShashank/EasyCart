// Scopes the cart to the current store slug for every nested storefront route.
import { useParams, Outlet } from 'react-router-dom';
import { CartProvider } from '@/features/cart/cart-provider';

export function StorefrontLayout() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <CartProvider slug={slug!}>
      <Outlet />
    </CartProvider>
  );
}
