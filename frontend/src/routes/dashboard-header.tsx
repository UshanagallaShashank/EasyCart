// Header bar for merchant dashboard with animated hover states
import { ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '@/shared/auth/auth-context';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { NotificationBell } from '@/features/notifications/components/notification-bell';

export function DashboardHeader() {
  const { logout } = useAuth();
  const { data: store } = useOwnStore();

  return (
    <header className="shrink-0 h-15 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <a href="/dashboard/store" className="group flex items-center gap-2 transition-opacity">
          <img src="/easy-cart-icon.png" alt="EasyCart" className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105" />
          <span className="font-bold text-slate-900 tracking-tight group-hover:text-sky-700 transition-colors">{store?.name ?? 'EasyCart'}</span>
        </a>
        {store?.slug && (
          <a href={`/${store.slug}`} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 hover:-translate-y-0.5 px-2.5 py-0.5 rounded-full font-medium shadow-xs transition-all duration-200">
            <span>Live Store</span>
            <ExternalLink className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 font-medium">
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
}
