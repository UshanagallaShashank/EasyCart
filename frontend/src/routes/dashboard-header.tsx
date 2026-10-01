// Slim top bar: mobile menu button with slide-in drawer, live store link and notifications.
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Menu, X } from 'lucide-react';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { DashboardNavContent } from './dashboard-nav';

export function DashboardHeader() {
  const { data: store } = useOwnStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-3">
          {store?.slug && (
            <a
              href={`/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition-all hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-sm"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">View live store</span><span className="sm:hidden">Live</span>
              <ExternalLink className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
          <NotificationBell />
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-64 max-w-[85vw] shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            >
              <DashboardNavContent onNavigate={() => setMenuOpen(false)} />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
