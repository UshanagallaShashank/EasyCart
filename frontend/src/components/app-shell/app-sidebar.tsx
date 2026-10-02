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
    </div>
  );
}
