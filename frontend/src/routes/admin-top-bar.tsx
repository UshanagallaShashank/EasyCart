// Admin top bar: menu button (phones), breadcrumb of the current section, profile, and a log-out button.
import { useLocation } from 'react-router-dom';
import { ChevronRight, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/auth/auth-context';
import { find_admin_location } from './admin-menu';
import { MENU_COLORS } from './admin-menu-colors';
import { AdminUserMenu } from './admin-user-menu';

export function AdminTopBar({ onOpenMenu }: { onOpenMenu(): void }) {
  const { pathname, search } = useLocation();
  const { logout } = useAuth();
  const { menu, entry } = find_admin_location(pathname, search);
  const title = pathname.startsWith('/admin/account') ? 'Account & access' : menu?.label ?? 'Admin';

  return (
    <header className="safe-top z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md md:px-6">
      <button onClick={onOpenMenu} aria-label="Open menu" className="-ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {menu && <span className={cn('hidden size-8 shrink-0 items-center justify-center rounded-lg sm:flex', MENU_COLORS[menu.color].tile)}><menu.icon className="size-4" /></span>}
        <p className="flex min-w-0 items-center gap-1.5 text-sm"><span className="truncate font-semibold text-slate-900">{title}</span>{entry && <><ChevronRight className="size-4 shrink-0 text-slate-300" /><span className="truncate text-slate-500">{entry.label}</span></>}</p>
      </div>
      <AdminUserMenu />
      <button type="button" onClick={logout} aria-label="Log out" title="Log out" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"><LogOut className="size-[18px]" /></button>
    </header>
  );
}
