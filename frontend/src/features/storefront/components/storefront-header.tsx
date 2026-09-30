// Navigation header for public customer storefronts.
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, UserCheck } from 'lucide-react';
import { useCart } from '@/features/cart/cart-context';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontHeader({ store, slug }: { store: PublicStore; slug: string }) {
  const { lines } = useCart();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-6 py-3.5 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to={`/${slug}`} className="flex items-center gap-3 group">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="size-10 rounded-xl object-cover ring-2 ring-sky-500/20 shadow-xs transition-transform group-hover:scale-105" />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500 text-white font-heading font-bold text-lg shadow-sm">
              {store.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="font-heading text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{store.name}</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link to={`/${slug}/products`} className="flex items-center gap-1.5 hover:text-sky-600 transition-colors">
            <Package className="size-4 text-sky-500" /> Products
          </Link>
          <Link to={`/${slug}/cart`} className="relative flex items-center gap-1.5 hover:text-sky-600 transition-colors">
            <ShoppingCart className="size-4 text-sky-500" /> Cart
            {count > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#F58220] text-[10px] font-bold text-white shadow-xs">
                {count}
              </span>
            )}
          </Link>
          <Link to="/customer/orders" className="flex items-center gap-1.5 hover:text-sky-600 transition-colors">
            <UserCheck className="size-4 text-sky-500" /> Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
