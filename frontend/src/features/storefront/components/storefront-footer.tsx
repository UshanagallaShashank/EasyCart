// Renders the customer storefront footer with branding and store details.
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontFooter({ store, slug }: { store: PublicStore; slug: string }) {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            {store.logo_url && <img src={store.logo_url} alt={store.name} className="size-8 rounded-full object-cover" />}
            <div>
              <p className="font-heading font-semibold text-slate-900">{store.name}</p>
              <p className="text-xs text-slate-500">Official Customer Store</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-600" /> Secure Payments</span>
            <span className="flex items-center gap-1.5"><Truck className="size-4 text-sky-600" /> Fast Delivery</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="size-4 text-amber-600" /> Easy Returns</span>
          </div>
          <p className="text-xs text-slate-400">
            Powered by <Link to="/" className="font-medium text-sky-600 hover:text-sky-700">EasyCart</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
