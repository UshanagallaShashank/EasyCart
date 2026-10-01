// One colorful sidebar entry: icon tile and label, with expandable sub-entries for grouped menus.
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { is_entry_active, is_menu_active, type AdminMenu } from './admin-menu';
import { MENU_COLORS } from './admin-menu-colors';

export function AdminSidebarItem({ menu, onNavigate }: { menu: AdminMenu; onNavigate?: () => void }) {
  const { pathname, search } = useLocation();
  const active = is_menu_active(menu, pathname);
  const [open, setOpen] = useState(active);
  const colors = MENU_COLORS[menu.color];
  const row = cn('flex h-11 w-full items-center gap-3 rounded-xl px-2 text-sm font-semibold transition-all', active ? `bg-gradient-to-r ${colors.active} text-white shadow-md` : 'text-slate-700 hover:bg-slate-100');
  const tile = <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', active ? 'bg-white/20 text-white' : colors.tile)}><menu.icon className="size-4" /></span>;

  if (menu.to) return <Link to={menu.to} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={row}>{tile}{menu.label}</Link>;

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open || active} className={row}>
        {tile}<span className="flex-1 text-left">{menu.label}</span><ChevronDown className={cn('mr-1 size-4 opacity-70 transition-transform', (open || active) && 'rotate-180')} />
      </button>
      {(open || active) && (
        <div className="mt-1 mb-1 ml-6 flex flex-col gap-0.5 border-l-2 border-slate-100 pl-3">
          {menu.entries?.map((e) => {
            const on = is_entry_active(e.to, pathname, search);
            return <Link key={e.to} to={e.to} onClick={onNavigate} aria-current={on ? 'page' : undefined} className={cn('flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors', on ? 'bg-slate-100 font-semibold text-slate-900' : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900')}><span className={cn('size-1.5 rounded-full', on ? colors.dot : 'bg-slate-300')} />{e.label}</Link>;
          })}
        </div>
      )}
    </div>
  );
}
