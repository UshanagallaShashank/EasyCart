// Shared frame for the customer's own order pages: page header plus a centered content column.
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/page-header';

interface CustomerPageShellProps {
  title: ReactNode;
  description?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function CustomerPageShell({ title, description, eyebrow, actions, children }: CustomerPageShellProps) {
  return (
    <div className="min-h-svh bg-slate-50/60 font-sans text-slate-900">
      <PageHeader title={title} description={description} eyebrow={eyebrow}>
        {actions}
      </PageHeader>
      <main className="mx-auto max-w-5xl animate-content-in px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
