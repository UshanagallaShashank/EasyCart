// Platform admin layout, in the store owner dashboard's colors: sidebar, top bar with profile and log out, scrollable page.
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopBar } from './admin-top-bar';

export function AdminLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <aside className="hidden h-full w-64 shrink-0 lg:block"><AdminSidebar /></aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopBar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="mx-auto w-full max-w-7xl p-4 md:p-8"><Outlet /></motion.div>
        </main>
      </div>
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)}><AdminSidebar onNavigate={() => setMenuOpen(false)} /></MobileNavDrawer>
    </div>
  );
}
