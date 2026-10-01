// Navigation header for public customer storefronts.
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingCart, UserCheck } from 'lucide-react';
import { useCart } from '@/features/cart/cart-context';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontHeader({ store, slug }: { store: PublicStore; slug: string }) {
  const { lines } = useCart();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 py-3 shadow-xs sm:px-6 sm:py-3.5"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to={`/${slug}`} className="flex items-center gap-3 group">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="size-10 rounded-xl object-cover ring-2 ring-sky-500/20 shadow-xs transition-transform group-hover:scale-105" />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500 text-white font-heading font-bold text-lg shadow-sm">
              {store.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="max-w-[7rem] truncate font-heading text-base font-bold text-slate-900 transition-colors group-hover:text-sky-600 sm:max-w-none sm:text-lg">{store.name}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-5 font-medium text-slate-600">
          <Link to={`/${slug}/products`} className="flex items-center gap-1.5 hover:text-sky-600 transition-colors">
            <Package className="size-4 text-sky-500" /> <span className="hidden sm:inline">Products</span>
          </Link>
          <Link to={`/${slug}/cart`} className="relative flex items-center gap-1.5 hover:text-sky-600 transition-colors">
            <ShoppingCart className="size-4 text-sky-500" /> <span className="hidden sm:inline">Cart</span>
            <AnimatePresence>
              {count > 0 && (
                // key={count} replays the pop every time the number changes
                <motion.span
                  key={count}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="flex size-5 items-center justify-center rounded-full bg-[#F58220] text-[10px] font-bold text-white shadow-xs"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Link to="/customer/orders" className="flex items-center gap-1.5 hover:text-sky-600 transition-colors">
            <UserCheck className="size-4 text-sky-500" /> <span className="hidden sm:inline">Account</span>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
