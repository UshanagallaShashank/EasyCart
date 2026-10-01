// Split auth page: brand panel on large screens, centered form column with title and footer link.
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { AuthBrandPanel } from './auth-brand-panel';

interface AuthLayoutProps {
  variant: 'merchant' | 'customer';
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ variant, title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <AuthBrandPanel variant={variant} />
      <main className="safe-top flex items-start justify-center px-4 pt-10 pb-12 sm:items-center sm:px-8 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-[440px]">
          <img src="/easy-cart-icon.png" alt="EasyCart" className="mb-8 h-11 w-auto lg:hidden" />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </motion.div>
      </main>
    </div>
  );
}
