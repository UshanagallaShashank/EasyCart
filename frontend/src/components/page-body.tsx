// Scrollable, centered content area that sits below a dashboard PageHeader.
import type { ReactNode } from 'react';

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">{children}</div>
    </div>
  );
}
