// Sidebar entry: a plain link, or a link with an expandable list of filtered sub-links.
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarLink } from './sidebar-link';
import { child_target, is_child_active, is_item_active } from './nav-matching';
import type { NavItemDef } from './nav-types';

export function SidebarItem({ item, onNavigate }: { item: NavItemDef; onNavigate?: () => void }) {
  const location = useLocation();
  const active = is_item_active(item, location.pathname);
  const [open, setOpen] = useState(active);
  if (!item.children?.length) return <SidebarLink to={item.to} label={item.label} icon={item.icon} active={active} onNavigate={onNavigate} />;

  const expanded = open || active;

  return (
    <div>
      <div className="relative">
        <SidebarLink to={item.to} label={item.label} icon={item.icon} className="pr-10" active={active && !item.children.some((c) => c.value && is_child_active(item, c, location))} onNavigate={onNavigate} />
        <button type="button" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.label}`} aria-expanded={expanded} disabled={active} onClick={() => setOpen(!open)} className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 disabled:hover:bg-transparent">
          <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
        </button>
      </div>
      {expanded && (
        <div className="mt-0.5 ml-[21px] flex flex-col gap-0.5 border-l border-slate-200 pl-3">
          {item.children.map((child) => {
            const on = is_child_active(item, child, location);
            return <Link key={child.label} to={child_target(item, child)} onClick={onNavigate} aria-current={on ? 'page' : undefined} className={cn('flex h-8 items-center rounded-lg px-2.5 text-[13px] transition-colors', on ? 'bg-white font-semibold text-sky-700 shadow-xs ring-1 ring-slate-200/80' : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900')}>{child.label}</Link>;
          })}
        </div>
      )}
    </div>
  );
}
