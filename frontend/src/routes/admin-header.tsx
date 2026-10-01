// Platform admin top bar: mobile menu with slide-in sidebar, current page title, and admin badge.
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { find_nav_title } from '@/components/app-shell/nav-matching';
import { ADMIN_SECTIONS } from './admin-links';
import { AdminNavContent } from './admin-nav-content';

export function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const title = find_nav_title(ADMIN_SECTIONS, useLocation());

  return (
    <>
      <header className="safe-top z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
          <span className="truncate text-sm font-semibold text-slate-900">{title ?? 'Admin'}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700"><ShieldCheck className="size-3.5" /> Platform admin</span>
      </header>
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <AdminNavContent onNavigate={() => setMenuOpen(false)} />
      </MobileNavDrawer>
    </>
  );
}
