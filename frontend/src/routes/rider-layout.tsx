// Delivery partner layout: the store dashboard's sidebar and top bar, plus a thumb-friendly bottom bar on phones.
// Profile and log out sit in the top bar, as in the admin area.
import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLoading } from '@/components/page-loading';
import { AppSidebar } from '@/components/app-shell/app-sidebar';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { find_nav_title } from '@/components/app-shell/nav-matching';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import { useAuth } from '@/shared/auth/auth-context';
import { useLiveUpdates } from '@/shared/live/use-live-updates';
import { RiderAvatar } from '@/features/delivery/components/rider-avatar';
import { useMyRider } from '@/features/rider/hooks/use-rider-queries';
import { ALL_RIDER_SECTIONS, riderBottomLinks, riderSections } from './rider-links';

function OnlinePill({ isOnline }: { isOnline: boolean }) {
  return (
    <span className={cn('hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-flex', isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
      <span className={cn('size-2 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-slate-400')} />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}

export function RiderLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { data: rider } = useMyRider();
  const isApproved = rider?.status === 'approved';
  const sections = riderSections(isApproved);
  const title = find_nav_title(ALL_RIDER_SECTIONS, useLocation());
  useLiveUpdates('owner');

  const sidebar = (onNavigate?: () => void) => <AppSidebar title="Delivery partner" homeTo="/rider" sections={sections} ariaLabel="Delivery partner" onNavigate={onNavigate} />;
  const name = rider?.full_name || user?.username || 'Rider';

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <aside className="hidden h-full w-64 shrink-0 lg:block">{sidebar()}</aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="safe-top z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{title ?? 'Delivery'}</span>
          {isApproved && <OnlinePill isOnline={Boolean(rider?.is_online)} />}
          <Link to="/rider/profile" aria-label="Your profile" className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-slate-100 sm:pr-3">
            <RiderAvatar name={name} photoUrl={rider?.photo_url ?? null} className="size-8 text-xs" />
            <span className="hidden max-w-32 truncate text-xs font-semibold text-slate-900 sm:inline">{name}</span>
          </Link>
          <LogoutConfirmDialog role="user" onConfirm={logout} trigger={
            <button type="button" aria-label="Log out" title="Log out" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"><LogOut className="size-4" /></button>
          } />
        </header>
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden"><Suspense fallback={<PageLoading />}><Outlet /></Suspense></main>
        <nav aria-label="Rider quick links" className={cn('safe-bottom grid shrink-0 border-t border-slate-200/80 bg-white lg:hidden', isApproved ? 'grid-cols-4' : 'grid-cols-3')}>
          {riderBottomLinks(isApproved).map(({ item, label }) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors', isActive ? 'text-sky-600' : 'text-slate-500 hover:text-slate-800')}>
              <item.icon className="size-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>{sidebar(() => setMenuOpen(false))}</MobileNavDrawer>
    </div>
  );
}
