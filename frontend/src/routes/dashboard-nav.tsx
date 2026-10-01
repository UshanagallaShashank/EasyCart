// Sidebar for the merchant dashboard. The same content is used in the desktop rail and the mobile drawer.
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/auth/auth-context';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { DASHBOARD_SECTIONS, type DashboardLink } from './dashboard-links';

function NavItem({ link, active, onNavigate }: { link: DashboardLink; active: boolean; onNavigate?: () => void }) {
  const Icon = link.icon;
  return (
    <Link to={link.to} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={cn('relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors', active ? 'font-semibold text-slate-900' : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900')}>
      {active && <motion.span layoutId="nav-active-pill" className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
      <Icon className={cn('relative size-[18px]', active ? 'text-sky-600' : 'text-slate-400')} />
      <span className="relative">{link.label}</span>
    </Link>
  );
}

export function DashboardNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { data: store } = useOwnStore();

  return (
    <div className="flex h-full flex-col border-r border-slate-200/80 bg-slate-50">
      <Link to="/dashboard/overview" onClick={onNavigate} className="flex items-center gap-3 px-5 pt-5 pb-4">
        <img src="/easy-cart-icon.png" alt="EasyCart" className="h-9 w-auto object-contain" />
        <span className="min-w-0 truncate text-sm font-semibold text-slate-900">{store?.name ?? 'Store dashboard'}</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-2" aria-label="Dashboard">
        {DASHBOARD_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{section.title}</p>
            <div className="flex flex-col gap-0.5">
              {section.links.map((link) => <NavItem key={link.to} link={link} active={pathname.startsWith(link.to)} onNavigate={onNavigate} />)}
            </div>
          </div>
        ))}
      </nav>
      <div className="safe-bottom flex items-center gap-3 border-t border-slate-200/80 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">{user?.username?.charAt(0).toUpperCase() ?? '?'}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{user?.username}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <button type="button" onClick={logout} aria-label="Log out" title="Log out" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600">
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function DashboardNav() {
  return (
    <aside className="hidden h-full w-64 shrink-0 lg:block">
      <DashboardNavContent />
    </aside>
  );
}
