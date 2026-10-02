// Delivery partner layout: the store dashboard's sidebar and top bar, plus a thumb-friendly bottom bar on phones.
import { Suspense, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLoading } from '@/components/page-loading';
import { AppSidebar } from '@/components/app-shell/app-sidebar';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { find_nav_title } from '@/components/app-shell/nav-matching';
import { useMyRider } from '@/features/rider/hooks/use-rider-queries';
import { RIDER_BOTTOM_LINKS, RIDER_SECTIONS } from './rider-links';

function RiderSidebar({ onNavigate }: { onNavigate?(): void }) {
  return <AppSidebar title="Delivery partner" homeTo="/rider" sections={RIDER_SECTIONS} ariaLabel="Delivery partner" onNavigate={onNavigate} />;
}

function OnlinePill() {
  const { data: rider } = useMyRider();
  if (rider?.status !== 'approved') return null;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold', rider.is_online ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
      <span className={cn('size-2 rounded-full', rider.is_online ? 'bg-emerald-500' : 'bg-slate-400')} />
      {rider.is_online ? 'Online' : 'Offline'}
    </span>
  );
}

export function RiderLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const title = find_nav_title(RIDER_SECTIONS, useLocation());

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <aside className="hidden h-full w-64 shrink-0 lg:block"><RiderSidebar /></aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="safe-top z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
            <span className="truncate text-sm font-semibold text-slate-900">{title ?? 'Delivery'}</span>
          </div>
          <OnlinePill />
        </header>
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden"><Suspense fallback={<PageLoading />}><Outlet /></Suspense></main>
        <nav aria-label="Rider quick links" className="safe-bottom grid shrink-0 grid-cols-4 border-t border-slate-200/80 bg-white lg:hidden">
          {RIDER_BOTTOM_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors', isActive ? 'text-sky-600' : 'text-slate-500 hover:text-slate-800')}>
              <Icon className="size-5" />
              <span className="max-w-full truncate px-1">{label === 'Profile & documents' ? 'Profile' : label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)}><RiderSidebar onNavigate={() => setMenuOpen(false)} /></MobileNavDrawer>
    </div>
  );
}
