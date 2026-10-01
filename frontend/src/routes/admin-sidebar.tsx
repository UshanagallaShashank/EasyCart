// Colorful platform admin sidebar: brand, navigation with sub-entries, and an "add an admin" card.
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ADMIN_MENUS } from './admin-menu';
import { AdminSidebarItem } from './admin-sidebar-item';

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col border-r border-slate-200/80 bg-white">
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 pt-5 pb-5">
        <img src="/easy-cart-icon.png" alt="EasyCart" className="h-10 w-auto" />
        <div><p className="text-sm font-bold text-slate-900">EasyCart</p><p className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-xs font-semibold text-transparent">Admin console</p></div>
      </Link>
      <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        <p className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Menu</p>
        {ADMIN_MENUS.map((menu) => <AdminSidebarItem key={menu.label} menu={menu} onNavigate={onNavigate} />)}
      </nav>
      <div className="safe-bottom p-3">
        <Link to="/admin/account" onClick={onNavigate} className="group block rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 p-4 text-white shadow-md">
          <Sparkles className="size-5" />
          <p className="mt-2 text-sm font-bold">Add another admin</p>
          <p className="mt-0.5 text-xs text-white/85">Share the sign-up link and passcode</p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
      </div>
    </div>
  );
}
