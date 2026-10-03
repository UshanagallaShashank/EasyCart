// Slim top bar: mobile menu button with slide-in drawer, notifications, and user menu.
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { find_nav_title } from '@/components/app-shell/nav-matching';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { DashboardUserMenu } from './dashboard-user-menu';
import { DashboardNavContent } from './dashboard-nav';
import { DASHBOARD_SECTIONS } from './dashboard-links';

export function DashboardHeader() {
  const { data: store } = useOwnStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const title = find_nav_title(DASHBOARD_SECTIONS, location);
  const isDeliveryPage = location.pathname.includes('/delivery');
  const badgeText = isDeliveryPage ? 'Delivery' : 'Owner';

  return (
    <>
      <header className="safe-top z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="-ml-2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <span className="truncate text-sm font-semibold text-slate-900">{title ?? store?.name}</span>
          <span className="rounded-full bg-sky-50 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-600 border border-sky-200/60 uppercase tracking-wider shrink-0 leading-none">
            {badgeText}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <DashboardUserMenu />
        </div>
      </header>

      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <DashboardNavContent onNavigate={() => setMenuOpen(false)} />
      </MobileNavDrawer>
    </>
  );
}
