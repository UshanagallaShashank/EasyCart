// Title block for platform admin pages, with a gradient icon tile in the current menu's color.
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { find_admin_location } from '@/routes/admin-menu';
import { MENU_COLORS } from '@/routes/admin-menu-colors';

export function AdminPageTitle({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  const { pathname, search } = useLocation();
  const { menu } = find_admin_location(pathname, search);
  const Icon = menu?.icon ?? UserCog;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md', MENU_COLORS[menu?.color ?? 'violet'].active)}><Icon className="size-6" /></span>
        <div><h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1><p className="mt-0.5 text-sm text-slate-500">{description}</p></div>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
