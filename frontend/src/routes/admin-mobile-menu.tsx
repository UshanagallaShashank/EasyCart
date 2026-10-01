// Phone/tablet admin menu: every section with its entries listed, inside the slide-in drawer.
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/auth/auth-context';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { ADMIN_MENUS, is_entry_active } from './admin-menu';

export function AdminMobileMenu({ open, onClose }: { open: boolean; onClose(): void }) {
  const { pathname, search } = useLocation();
  const { user, logout } = useAuth();
  const link = (to: string, label: string) => <Link key={to} to={to} onClick={onClose} className={cn('flex h-10 items-center rounded-lg px-3 text-sm', is_entry_active(to, pathname, search) ? 'bg-sky-50 font-semibold text-sky-700' : 'text-slate-600 hover:bg-slate-100')}>{label}</Link>;

  return (
    <MobileNavDrawer open={open} onClose={onClose}>
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4"><img src="/easy-cart-icon.png" alt="EasyCart" className="h-9 w-auto" /><span className="text-sm font-semibold text-slate-900">Platform admin</span></div>
        <nav aria-label="Admin" className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
          {ADMIN_MENUS.map((menu) => (
            <div key={menu.label}>
              <p className="mb-1 flex items-center gap-2 px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase"><menu.icon className="size-3.5" /> {menu.label}</p>
              {menu.to ? link(menu.to, menu.label) : menu.entries?.map((e) => link(e.to, e.label))}
            </div>
          ))}
        </nav>
        <div className="safe-bottom flex flex-col gap-1 border-t border-slate-200 p-3">
          <p className="truncate px-3 pb-1 text-xs text-slate-500">{user?.email}</p>
          {link('/admin/account', 'Account & access')}
          <button type="button" onClick={logout} className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-rose-600 hover:bg-rose-50"><LogOut className="size-4" /> Log out</button>
        </div>
      </div>
    </MobileNavDrawer>
  );
}
