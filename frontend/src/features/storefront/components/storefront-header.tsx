// Navigation header for public customer storefronts.
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingCart, UserCheck, User, LogOut, PackageCheck, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { useCart } from '@/features/cart/cart-context';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontHeader({ store, slug }: { store: PublicStore; slug: string }) {
  const { lines } = useCart();
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    navigate(`/${slug}`);
  }

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-sky-600 transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md py-1 px-1.5"
              >
                {user ? (
                  <UserCheck className="size-4 text-sky-500" />
                ) : (
                  <User className="size-4 text-slate-500" />
                )}
                <span className="hidden sm:inline font-medium">
                  {user ? user.username || 'Account' : 'Account'}
                </span>
                <ChevronDown className="size-3 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              {user ? (
                <>
                  <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900 leading-none truncate">{user.username}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2 px-2"
                    onSelect={() => navigate('/customer/orders')}
                  >
                    <PackageCheck className="size-4 text-sky-500" />
                    <span>My orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2 px-2"
                    onSelect={() => navigate(`/${slug}/cart`)}
                  >
                    <ShoppingCart className="size-4 text-slate-500" />
                    <span>My cart</span>
                    {count > 0 && (
                      <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer gap-2 py-2 px-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                    onSelect={handleLogout}
                  >
                    <LogOut className="size-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="px-2 py-1.5 text-xs text-slate-500 font-medium">
                    Customer Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2 px-2"
                    onSelect={() => navigate(`/customer/login?redirect=${encodeURIComponent('/' + slug)}`)}
                  >
                    <LogIn className="size-4 text-sky-500" />
                    <span>Sign in</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2 px-2"
                    onSelect={() => navigate(`/customer/register?redirect=${encodeURIComponent('/' + slug)}`)}
                  >
                    <UserPlus className="size-4 text-slate-500" />
                    <span>Create account</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </motion.header>
  );
}

