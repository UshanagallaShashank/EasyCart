// Console-style frame for platform admin sign-in pages: dark grid backdrop, centered white card.
import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';

interface AdminAuthShellProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AdminAuthShell({ title, subtitle, footer, children }: AdminAuthShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-slate-950 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative mb-6 flex items-center gap-2.5 text-white">
        <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"><ShieldCheck className="size-5 text-sky-300" /></span>
        <span className="text-sm font-semibold tracking-wide">EasyCart <span className="text-slate-400">Platform Console</span></span>
      </div>
      <main className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl shadow-black/40 sm:p-8">
        <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </main>
      <p className="relative mt-6 text-center text-sm text-slate-400">{footer}</p>
    </div>
  );
}
