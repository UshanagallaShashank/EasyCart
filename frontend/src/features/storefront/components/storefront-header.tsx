// Navigation header for public customer storefronts.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, User, LogOut, PackageCheck, LogIn, UserPlus, ChevronDown, Menu, X, Home, Package, ShoppingCart, Store } from 'lucide-react';
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
import { CustomerProfileModal } from './customer-profile-modal';

export function StorefrontHeader({ store, slug }: { store: PublicStore; slug: string }) {
  const { lines } = useCart();
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    navigate(`/${slug}`);
  }

  return (
    <>
      <CustomerProfileModal open={profileOpen} onOpenChange={setProfileOpen} slug={slug} />
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3 shadow-xs sm:px-6 sm:py-3.5"
      >
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <Link to={`/${slug}`} className="flex items-center gap-3 group">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="size-9 sm:size-10 rounded-xl object-cover ring-2 ring-sky-500/20 shadow-xs transition-transform group-hover:scale-105" />
              ) : (
                <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-heading font-bold text-lg shadow-sm">
                  {store.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-[9rem] truncate font-heading text-base font-bold text-slate-900 transition-colors group-hover:text-sky-600 sm:max-w-none sm:text-lg">{store.name}</span>
            </Link>
          </div>

          {/* Top bar right area: Cart + User / Account */}
          <nav className="flex items-center gap-2.5">
            <Link
              to={`/${slug}/cart`}
              className="relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="size-4 text-sky-500" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#F58220] text-[10px] font-bold text-white shadow-xs"
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
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold min-[400px]:px-3 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  {user ? (
                    <div className="flex size-6 items-center justify-center rounded-full bg-sky-500 text-white">
                      <UserCheck className="size-3.5" />
                    </div>
                  ) : (
                    <div className="flex size-6 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <User className="size-3.5" />
                    </div>
                  )}
                  <span className="hidden min-[400px]:inline max-w-[100px] sm:max-w-[140px] truncate">
                    {user ? user.username || 'Account' : 'Sign In'}
                  </span>
                  <ChevronDown className="size-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 z-50">
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
                      className="cursor-pointer gap-2 py-2 px-2 font-medium"
                      onSelect={() => setProfileOpen(true)}
                    >
                      <User className="size-4 text-sky-500" />
                      <span>View profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 py-2 px-2"
                      onSelect={() => navigate(`/${slug}/orders`)}
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
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 py-2 px-2"
                      onSelect={() => navigate(`/${slug}/store-request`)}
                    >
                      <Store className="size-4 text-amber-500" />
                      <span>Request to create a store</span>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      className="cursor-pointer gap-2 py-2 px-2"
                      onSelect={() => navigate(`/${slug}/store-request`)}
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

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden pt-3 border-t border-slate-100 mt-3"
          >
            <nav className="flex flex-col space-y-1 pb-2">
              <Link
                to={`/${slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Home className="size-4.5 text-slate-400" /> Home
              </Link>
              <Link
                to={`/${slug}/products`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Package className="size-4.5 text-sky-500" /> Products
              </Link>
              <Link
                to={`/${slug}/cart`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="size-4.5 text-sky-500" /> Cart
                </div>
                {count > 0 && (
                  <span className="flex size-5.5 items-center justify-center rounded-full bg-[#F58220] text-xs font-bold text-white">
                    {count}
                  </span>
                )}
              </Link>
              <Link
                to={`/${slug}/orders`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <PackageCheck className="size-4.5 text-emerald-500" /> My Orders
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  </>
  );
}

