// Slim top bar: mobile menu button with slide-in drawer, live store link and notifications.
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ExternalLink, Menu } from 'lucide-react';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { find_nav_title } from '@/components/app-shell/nav-matching';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { DashboardNavContent } from './dashboard-nav';
import { DASHBOARD_SECTIONS } from './dashboard-links';

export function DashboardHeader() {
  const { data: store } = useOwnStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const title = find_nav_title(DASHBOARD_SECTIONS, useLocation());

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
        </div>
        <div className="flex items-center gap-3">
          {store?.slug && (
            <a
              href={`/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition-all hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-sm"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">View live store</span><span className="sm:hidden">Live</span>
              <ExternalLink className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
          <NotificationBell />
        </div>
      </header>

      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <DashboardNavContent onNavigate={() => setMenuOpen(false)} />
      </MobileNavDrawer>
    </>
  );
}
