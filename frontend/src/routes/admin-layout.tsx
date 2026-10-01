// Platform admin layout: top bar with dropdown menus, then the full-width scrollable page.
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { AdminTopBar } from './admin-top-bar';

export function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-slate-50">
      <AdminTopBar />
      <main className="flex-1 overflow-y-auto">
        <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="mx-auto w-full max-w-7xl p-4 md:p-8">
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
