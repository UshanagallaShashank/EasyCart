// Shared frame for customer order pages inside the storefront layout pane.
import type { ReactNode } from 'react';

interface CustomerPageShellProps {
  title: ReactNode;
  description?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function CustomerPageShell({ title, description, eyebrow, actions, children }: CustomerPageShellProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
          <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
