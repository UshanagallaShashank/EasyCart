// Platform admin layout, in the store owner dashboard's colors: sidebar, top bar with profile and log out, scrollable page.
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoading } from '@/components/page-loading';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopBar } from './admin-top-bar';
import { useLiveUpdates } from '@/shared/live/use-live-updates';

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  useLiveUpdates('owner');

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <aside className="hidden h-full w-64 shrink-0 lg:block"><AdminSidebar /></aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopBar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-x-clip overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-8"><Suspense fallback={<PageLoading />}><Outlet /></Suspense></div>
        </main>
      </div>
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)}><AdminSidebar onNavigate={() => setMenuOpen(false)} /></MobileNavDrawer>
    </div>
  );
}
