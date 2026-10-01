// Dark sidebar for the platform admin console: brand, sections, and the signed-in admin with log out.
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Users, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/auth/auth-context';

export const ADMIN_SECTIONS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/stores', label: 'Stores', icon: Store, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false }
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <img src="/easy-cart-icon.png" alt="EasyCart" className="h-10 w-auto rounded-xl bg-white p-1" />
        <div><p className="text-sm font-semibold text-white">EasyCart</p><p className="flex items-center gap-1 text-xs text-sky-300"><ShieldCheck className="size-3.5" /> Platform admin</p></div>
      </div>
      <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1 px-3 py-2">
        {ADMIN_SECTIONS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => cn('flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors', isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white')}>
            <Icon className="size-[18px]" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="safe-bottom flex items-center gap-3 border-t border-white/10 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-200">{user?.username?.charAt(0).toUpperCase() ?? 'A'}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{user?.username}</p><p className="truncate text-xs text-slate-400">{user?.email}</p></div>
        <button type="button" onClick={logout} aria-label="Log out" title="Log out" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"><LogOut className="size-4" /></button>
      </div>
    </div>
  );
}
