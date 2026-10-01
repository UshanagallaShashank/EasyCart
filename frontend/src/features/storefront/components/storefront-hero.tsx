// Storefront hero banner presenting the store's banner image, name, and shop call-to-action.
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PublicStore } from '../types/storefront-types';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function rise_in(order: number) {
  return { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.1 + order * 0.1 } };
}

export function StorefrontHero({ store }: { store: PublicStore }) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-slate-900">
      {store.banner_url ? (
        <motion.img src={store.banner_url} alt="" className="absolute inset-0 -z-10 size-full object-cover" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: EASE_OUT }} />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_#38bdf8_0%,_#0369a1_40%,_#0f172a_85%)]" />
      )}
      <div className="flex min-h-[340px] flex-col justify-end bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-6 sm:min-h-[440px] sm:p-12 lg:p-16">
        <motion.p {...rise_in(0)} className="text-sm font-semibold tracking-wide text-sky-200">Welcome to {store.name}</motion.p>
        <motion.h1 {...rise_in(1)} className="mt-2 max-w-2xl font-heading text-3xl leading-tight font-extrabold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
          Good things, picked for you.
        </motion.h1>
        <motion.div {...rise_in(2)} className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-base font-semibold text-slate-900 hover:bg-slate-100">
            <Link to={`/${store.slug}/products`}>Shop now <ArrowRight className="size-4" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
