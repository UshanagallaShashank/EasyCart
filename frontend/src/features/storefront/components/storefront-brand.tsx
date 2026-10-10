// Store logo (or monogram fallback) and name, linking back to the storefront home.
import { Link } from 'react-router-dom';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontBrand({ store }: { store: PublicStore }) {
  return (
    <Link to={`/${store.slug}`} className="group flex min-w-0 items-center gap-2.5">
      {store.logo_url ? (
        <img src={store.logo_url} alt="" className="size-9 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 transition-transform group-hover:scale-105 sm:size-10" />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 font-heading text-lg font-bold text-white shadow-sm sm:size-10">
          {store.name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="flex items-center gap-2 min-w-0">
        <span className="truncate font-heading text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-sky-700 sm:text-lg">
          {store.name}
        </span>
        <span className="rounded-full bg-sky-50 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-600 border border-sky-200/60 uppercase tracking-wider shrink-0 leading-none">
          Store
        </span>
      </div>
    </Link>
  );
}
