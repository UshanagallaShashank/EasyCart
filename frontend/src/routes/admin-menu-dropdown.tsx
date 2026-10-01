// One top-bar menu: a plain link, or a button that opens a dropdown of its entries with short hints.
import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { is_entry_active, is_menu_active, type AdminMenu } from './admin-menu';

const TRIGGER = 'inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-sky-500/30';

export function AdminMenuDropdown({ menu }: { menu: AdminMenu }) {
  const { pathname, search } = useLocation();
  const active = is_menu_active(menu, pathname);
  const tone = active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  const Icon = menu.icon;
  if (menu.to) return <Link to={menu.to} aria-current={active ? 'page' : undefined} className={cn(TRIGGER, tone)}><Icon className="size-4" /> {menu.label}</Link>;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={cn(TRIGGER, tone, 'data-[state=open]:bg-slate-100')}>
        <Icon className="size-4" /> {menu.label} <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-72 rounded-xl p-1.5">
        {menu.entries?.map((entry) => {
          const on = is_entry_active(entry.to, pathname, search);
          return (
            <DropdownMenuItem key={entry.to} asChild className="rounded-lg px-2.5 py-2">
              <Link to={entry.to} className="flex items-start gap-2">
                <span className="min-w-0 flex-1"><span className={cn('block text-sm font-medium', on ? 'text-sky-700' : 'text-slate-900')}>{entry.label}</span><span className="block text-xs text-slate-500">{entry.hint}</span></span>
                {on && <Check className="mt-0.5 size-4 text-sky-600" />}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
