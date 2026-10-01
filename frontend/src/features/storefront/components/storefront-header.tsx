// Sticky navigation header for public customer storefronts.
import { useNavigate } from 'react-router-dom';
import { Home, Store, ShoppingBag, UserRound, PackageCheck, LogOut, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/features/cart/cart-context';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { StorefrontBrand } from './storefront-brand';
import { StorefrontNavLink } from './storefront-nav-link';
import { CartCountBadge } from './cart-count-badge';
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
    <header className="safe-top sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <StorefrontBrand store={store} />
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1" aria-label="Store navigation">
          <StorefrontNavLink to={`/${slug}`} icon={Home} label="Home" end />
          <StorefrontNavLink to={`/${slug}/products`} icon={Store} label="Shop" />
          <StorefrontNavLink to={`/${slug}/cart`} icon={ShoppingBag} label="Cart">
            <CartCountBadge count={count} />
          </StorefrontNavLink>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account"
                className="relative flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <UserRound className="size-[18px]" />
                <span className="hidden md:inline">{user?.username || 'Account'}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-lg">
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
                    onSelect={() => navigate('/customer/store-request')}
                  >
                    <Store className="size-4 text-amber-500" />
                    <span>Request to create a store</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer gap-2 py-2 px-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2 px-2"
                    onSelect={() => navigate('/customer/store-request')}
                  >
                    <Store className="size-4 text-amber-500" />
                    <span>Request to create a store</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
