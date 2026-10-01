// Platform admin layout, matching the store owner dashboard: sidebar on the left, top bar and scrollable page on the right.
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { AdminHeader } from './admin-header';
import { AdminNavContent } from './admin-nav-content';

export function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <aside className="hidden h-full w-64 shrink-0 lg:block"><AdminNavContent /></aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex flex-1 flex-col overflow-hidden">
          <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full max-w-7xl"><Outlet /></div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
