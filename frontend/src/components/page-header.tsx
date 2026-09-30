// Reusable fixed page header with title, description, and action slots
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="shrink-0 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 py-3.5 md:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2.5 shrink-0">{children}</div>}
      </div>
    </div>
  );
}
