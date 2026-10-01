// Shopper-facing auth frame: light page, back-to-store link, and a centered card.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

interface CustomerAuthShellProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export function CustomerAuthShell({ title, subtitle, footer, children }: CustomerAuthShellProps) {
  const lastSlug = sessionStorage.getItem('last_store_slug');

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <header className="safe-top flex h-14 items-center px-4 sm:px-6">
        {lastSlug && <Link to={`/${lastSlug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="size-4" /> Back to store</Link>}
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-12 sm:items-center">
        <div className="w-full max-w-[400px] rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#F58220]/10 text-[#F58220]"><ShoppingBag className="size-6" /></span>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </main>
    </div>
  );
}
