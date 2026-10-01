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
      className="relative mx-4 mt-4 sm:mx-6 sm:mt-6 overflow-hidden rounded-3xl border border-slate-200/80 shadow-lg"
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
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-sky-700 to-slate-900">
          <motion.div
            className="absolute -right-16 -top-16 size-72 rounded-full bg-sky-300/30 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-20 left-1/4 size-80 rounded-full bg-white/15 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}
      <div className="relative z-10 flex min-h-[300px] flex-col justify-end bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-6 sm:min-h-[340px] sm:p-12">
        <motion.div
          {...riseIn(0)}
          className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md"
        >
          <Sparkles className="size-3.5 text-[#F58220]" /> Welcome to {store.name}
        </motion.div>
        <motion.h1 {...riseIn(1)} className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-5xl">
          Curated Quality, Delivered to You.
        </motion.h1>
        <motion.div {...riseIn(2)} className="mt-5 flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Button asChild size="lg" className="h-10 bg-[#F58220] px-4 font-semibold text-white shadow-md shadow-orange-500/30 hover:bg-[#e07519]">
              <Link to={`/${store.slug}/products`}>
                Explore Collection <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
