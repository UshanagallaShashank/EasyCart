// Title block for platform admin pages, with the current section's icon in the dashboard's sky accent.
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import { is_item_active } from '@/components/app-shell/nav-matching';
import { ADMIN_SECTIONS } from '@/routes/admin-links';

export function AdminPageTitle({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  const { pathname } = useLocation();
  const Icon = ADMIN_SECTIONS.flatMap((s) => s.items).find((i) => is_item_active(i, pathname))?.icon ?? UserCog;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Icon className="size-5" /></span>
        <div><h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1><p className="mt-0.5 text-sm text-slate-500">{description}</p></div>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
