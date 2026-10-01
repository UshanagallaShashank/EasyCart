// Platform admin layout: dark sidebar on desktop, top bar with slide-in menu on phones, scrollable content.
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu } from 'lucide-react';
import { AdminSidebar, ADMIN_SECTIONS } from './admin-sidebar';

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const section = [...ADMIN_SECTIONS].reverse().find((s) => (s.end ? pathname === s.to : pathname.startsWith(s.to)));

  return (
    <div className="flex h-svh w-full overflow-hidden bg-slate-50">
      <aside className="hidden h-full w-64 shrink-0 lg:block"><AdminSidebar /></aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="safe-top flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Menu className="size-5" /></button>
          <span className="text-sm font-semibold text-slate-900">{section?.label ?? 'Admin'}</span>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div key={pathname} className="mx-auto w-full max-w-7xl animate-content-in"><Outlet /></div>
        </main>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
            <motion.div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
              <AdminSidebar onNavigate={() => setMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
