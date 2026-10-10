// Prominent storefront hero banner presenting store branding and call-to-action.
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PublicStore } from '../types/storefront-types';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Each piece of hero text rises in a little after the one before it.
function riseIn(order: number) {
  return {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.15 + order * 0.12 }
  };
}

export function StorefrontHero({ store }: { store: PublicStore }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="relative mx-4 mt-4 sm:mx-6 sm:mt-6 overflow-hidden rounded-3xl border border-sky-100 shadow-xl shadow-sky-500/5"
    >
      {store.banner_url ? (
        <motion.img
          src={store.banner_url}
          alt={store.name}
          className="absolute inset-0 size-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: EASE_OUT }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          <motion.div
            className="absolute -right-12 -top-12 size-96 rounded-full bg-cyan-400/40 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-20 left-10 size-96 rounded-full bg-amber-300/40 blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full bg-rose-400/30 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}
      <div className="relative z-10 flex min-h-[320px] flex-col justify-end bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-6 sm:min-h-[360px] sm:p-12">
        <motion.div
          {...riseIn(0)}
          className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-sm"
        >
          <Sparkles className="size-3.5 text-amber-300 animate-pulse" /> Welcome to {store.name}
        </motion.div>
        <motion.h1 {...riseIn(1)} className="font-heading text-3xl font-black tracking-tight text-white sm:text-5xl drop-shadow-sm">
          Curated Quality, Delivered to You.
        </motion.h1>
        <motion.p {...riseIn(1.5)} className="mt-2 max-w-xl text-sm font-medium text-slate-100/90 sm:text-base">
          Explore our handpicked selection of top products crafted for convenience, reliability, and everyday style.
        </motion.p>
        <motion.div {...riseIn(2)} className="mt-6 flex flex-wrap items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Button asChild size="lg" className="h-11 bg-[#F58220] px-6 font-bold text-white shadow-lg shadow-orange-500/35 hover:bg-[#e07519] rounded-xl">
              <Link to={`/${store.slug}/products`}>
                Explore Collection <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
