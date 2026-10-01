// Admin top bar, styled like the store owner dashboard: menu button (phones), page title, profile, and log out.
import { useLocation } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/shared/auth/auth-context';
import { find_nav_title } from '@/components/app-shell/nav-matching';
import { ADMIN_SECTIONS } from './admin-links';
import { AdminUserMenu } from './admin-user-menu';
import { AdminNotificationBell } from '@/features/admin/components/admin-notification-bell';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';

export function AdminTopBar({ onOpenMenu }: { onOpenMenu(): void }) {
  const { logout } = useAuth();
  const title = find_nav_title(ADMIN_SECTIONS, useLocation());

  return (
    <header className="safe-top z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <button onClick={onOpenMenu} aria-label="Open menu" className="-ml-2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{title ?? 'Admin'}</span>
      <div className="flex items-center gap-2">
        <AdminNotificationBell />
        <AdminUserMenu />
        <LogoutConfirmDialog
          role="admin"
          onConfirm={logout}
          trigger={
            <button
              type="button"
              aria-label="Log out"
              title="Log out"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          }
        />
      </div>
    </header>
  );
}
