// Sticky navigation header for public customer storefronts.
import { Home, Store, ShoppingBag, UserRound } from 'lucide-react';
import { useCart } from '@/features/cart/cart-context';
import { StorefrontBrand } from './storefront-brand';
import { StorefrontNavLink } from './storefront-nav-link';
import { CartCountBadge } from './cart-count-badge';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontHeader({ store, slug }: { store: PublicStore; slug: string }) {
  const { lines } = useCart();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <StorefrontBrand store={store} />
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1" aria-label="Store navigation">
          <StorefrontNavLink to={`/${slug}`} icon={Home} label="Home" end />
          <StorefrontNavLink to={`/${slug}/products`} icon={Store} label="Shop" />
          <StorefrontNavLink to={`/${slug}/cart`} icon={ShoppingBag} label="Cart">
            <CartCountBadge count={count} />
          </StorefrontNavLink>
          <StorefrontNavLink to="/customer/orders" icon={UserRound} label="Account" />
        </nav>
      </div>
    </header>
  );
}
