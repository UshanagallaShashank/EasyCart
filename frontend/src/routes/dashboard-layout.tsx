// Merchant dashboard layout: full-height sidebar on the left, top bar and scrollable page on the right.
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardHeader } from './dashboard-header';
import { DashboardNav } from './dashboard-nav';

export function DashboardLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-svh w-full overflow-hidden bg-slate-50">
      <DashboardNav />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex flex-1 flex-col overflow-hidden">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
