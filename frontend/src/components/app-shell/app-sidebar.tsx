import { Link } from 'react-router-dom';
import { SidebarItem } from './sidebar-item';
import type { NavSection } from './nav-types';

interface AppSidebarProps {
  title: string;
  homeTo: string;
  sections: NavSection[];
  ariaLabel: string;
  onNavigate?: () => void;
}

export function AppSidebar({ title, homeTo, sections, ariaLabel, onNavigate }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-slate-200/80 bg-slate-50">
      <Link to={homeTo} onClick={onNavigate} className="flex items-center gap-3 px-5 pt-5 pb-4">
        <img src="/easy-cart-icon.png" alt="EasyCart" className="h-9 w-auto object-contain" />
        <span className="min-w-0 truncate text-sm font-semibold text-slate-900">{title}</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-2" aria-label={ariaLabel}>
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{section.title}</p>
            <div className="flex flex-col gap-0.5">{section.items.map((item) => <SidebarItem key={item.to} item={item} onNavigate={onNavigate} />)}</div>
          </div>
        ))}
      </nav>
      <div className="safe-bottom flex items-center gap-3 border-t border-slate-200/80 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">{user?.username?.charAt(0).toUpperCase() ?? '?'}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{user?.username}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div>
        <LogoutConfirmDialog
          role={user?.role === 'platform_admin' ? 'admin' : user?.role === 'delivery_partner' ? 'user' : 'owner'}
          onConfirm={logout}
          trigger={
            <button
              type="button"
              aria-label="Log out"
              title="Log out"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          }
        />
      </div>
    </div>
  );
}
