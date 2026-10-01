// Platform admin layout with fixed top header and scrollable content
import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';
import { useAuth } from '@/shared/auth/auth-context';

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="h-svh w-full flex flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="shrink-0 h-15 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppLogo />
          <span className="bg-sky-50 text-[#0284C7] border border-sky-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Platform Admin
          </span>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 transition-colors font-medium">
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
