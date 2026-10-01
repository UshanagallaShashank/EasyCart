// Title block used at the top of every platform admin page, with an optional actions slot.
import type { ReactNode } from 'react';

export function AdminPageTitle({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
