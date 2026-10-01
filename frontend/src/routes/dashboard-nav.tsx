// Dark sidebar for the merchant dashboard. The same content is used in the desktop rail and the mobile drawer.
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, Store, Tags, Package, ClipboardList, Users, Ticket, LogOut, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/shared/auth/auth-context';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';

interface NavLink {
  to: string;
  label: string;
  icon: LucideIcon;
}

const LINKS: NavLink[] = [
  { to: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/store', label: 'Store', icon: Store },
  { to: '/dashboard/categories', label: 'Categories', icon: Tags },
  { to: '/dashboard/products', label: 'Products', icon: Package },
  { to: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/coupons', label: 'Coupons', icon: Ticket }
];

export function DashboardNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { data: store } = useOwnStore();

  return (
    <div className="flex h-full flex-col border-r border-slate-200/80 bg-white text-slate-600">
      <Link to="/dashboard/overview" onClick={onNavigate} className="flex flex-col gap-1.5 px-5 py-5">
        <img src="/easy-cart-icon.png" alt="EasyCart" className="h-10 w-auto self-start object-contain" />
        <span className="block truncate text-xs font-medium text-slate-500">{store?.name ?? 'Store dashboard'}</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="flex flex-col gap-1">
          {LINKS.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                    active ? 'font-semibold text-[#0284C7]' : 'font-medium text-slate-600 hover:translate-x-1 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  {/* One highlight is shared by all links; layoutId makes it slide to whichever link is active */}
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-xl bg-sky-50 shadow-xs"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    >
                      <span className="absolute inset-y-2.5 right-1.5 w-1 rounded-full bg-[#0284C7]" />
                    </motion.span>
                  )}
                  <Icon className={`relative size-4 transition-all duration-200 ${active ? 'scale-105 text-[#0284C7]' : 'text-slate-400 group-hover:scale-110 group-hover:text-[#0284C7]'}`} />
                  <span className="relative">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="safe-bottom border-t border-slate-100 p-3">
        <p className="truncate px-3 pb-2 text-[11px] text-slate-400">{user?.email}</p>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </div>
    </div>
  );
}

export function DashboardNav() {
  return (
    <aside className="hidden h-full w-60 shrink-0 lg:block xl:w-64">
      <DashboardNavContent />
    </aside>
  );
}
