// Platform admin sidebar in the store owner dashboard's style: brand, grouped sections, sub-links.
import { Link } from 'react-router-dom';
import { SidebarItem } from '@/components/app-shell/sidebar-item';
import { ADMIN_SECTIONS } from './admin-links';

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col border-r border-slate-200/80 bg-slate-50">
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2 px-5 pt-5 pb-4">
        <img src="/easy-cart-icon.png" alt="EasyCart" className="h-9 w-auto object-contain" />
        <span className="min-w-0 truncate text-sm font-semibold text-slate-900">Platform admin</span>
        <span className="rounded-full bg-sky-50 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-600 border border-sky-200/60 uppercase tracking-wider shrink-0 leading-none">
          Admin
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-2" aria-label="Admin">
        {ADMIN_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{section.title}</p>
            <div className="flex flex-col gap-0.5">{section.items.map((item) => <SidebarItem key={item.to} item={item} onNavigate={onNavigate} />)}</div>
          </div>
        ))}
      </nav>
    </div>
  );
}
