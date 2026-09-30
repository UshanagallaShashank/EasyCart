// Prominent storefront hero banner presenting store branding and call-to-action.
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontHero({ store }: { store: PublicStore }) {
  return (
    <div className="relative overflow-hidden rounded-2xl mx-6 mt-6 border border-slate-200/80 shadow-md">
      {store.banner_url ? (
        <img src={store.banner_url} alt={store.name} className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-700 to-slate-900" />
      )}
      <div className="relative z-10 flex min-h-[260px] flex-col justify-end bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-8 sm:p-10">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md mb-3 border border-white/20">
          <Sparkles className="size-3.5 text-[#F58220]" /> Welcome to {store.name}
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Curated Quality, Delivered to You.
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <Button asChild className="bg-[#F58220] hover:bg-[#e07519] text-white shadow-sm font-semibold">
            <Link to={`/${store.slug}/products`}>Explore Collection <ArrowRight className="ml-1.5 size-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
