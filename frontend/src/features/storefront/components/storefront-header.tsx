import { Link } from 'react-router-dom';
import { Package, ShoppingCart, ClipboardList } from 'lucide-react';
import { useCart } from '@/features/cart/cart-context';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontHeader({ store, slug }: { store: PublicStore; slug: string }) {
  const { lines } = useCart();
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <header className="bg-card flex items-center justify-between border-b px-6 py-4">
      <Link to={`/${slug}`} className="flex items-center gap-3">
        {store.logo_url ? (
          <img src={store.logo_url} alt={store.name} className="size-10 rounded-full object-cover" />
        ) : (
          <span className="bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-full font-heading text-lg">
            {store.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="font-heading text-lg">{store.name}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link to={`/${slug}/products`} className="flex items-center gap-1 hover:underline">
          <Package className="size-4" /> Products
        </Link>
        <Link to={`/${slug}/cart`} className="relative flex items-center gap-1 hover:underline">
          <ShoppingCart className="size-4" /> Cart
          {itemCount > 0 && (
            <span className="bg-accent text-accent-foreground absolute -top-2 -right-3 flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums">
              {itemCount}
            </span>
          )}
        </Link>
        <Link to="/customer/orders" className="flex items-center gap-1 hover:underline">
          <ClipboardList className="size-4" /> My orders
        </Link>
      </nav>
    </header>
  );
}
