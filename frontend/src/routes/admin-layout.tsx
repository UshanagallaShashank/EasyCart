// Platform admin layout: sticky top bar with brand, signed-in admin, and log out; scrollable content.
import { Outlet } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/shared/auth/auth-context';

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-slate-50">
      <header className="safe-top z-30 shrink-0 border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <div className="flex items-center gap-3">
            <img src="/easy-cart-icon.png" alt="EasyCart" className="h-9 w-auto" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"><ShieldCheck className="size-3.5" /> Platform admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.email}</span>
            <button type="button" onClick={logout} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
              <LogOut className="size-4" /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-7xl"><Outlet /></div>
      </main>
    </div>
  );
}
