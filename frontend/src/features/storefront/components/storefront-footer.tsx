// Storefront footer with store identity, quick links, trust points, and EasyCart credit.
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Store } from 'lucide-react';
import type { PublicStore } from '../types/storefront-types';

export function StorefrontFooter({ store, slug }: { store: PublicStore; slug: string }) {
  const links = [
    { to: `/${slug}/products`, label: 'Shop all' },
    { to: `/${slug}/cart`, label: 'Cart' },
    { to: '/customer/orders', label: 'My orders' }
  ];

  return (
    <footer className="safe-bottom mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-[1.5fr_1fr_1fr] sm:px-6">
        <div>
          <p className="font-heading text-lg font-bold text-slate-900">{store.name}</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">Thanks for shopping local. We're glad you're here.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <p className="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">Shop</p>
          {links.map((l) => <Link key={l.to} to={l.to} className="w-fit text-slate-600 hover:text-slate-900">{l.label}</Link>)}
        </nav>
        <ul className="flex flex-col gap-2 text-sm text-slate-600">
          <li className="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">Shop with confidence</li>
          <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" /> Secure checkout</li>
          <li className="flex items-center gap-2"><Truck className="size-4 text-sky-600" /> Local delivery</li>
          <li className="flex items-center gap-2"><Store className="size-4 text-amber-600" /> In-store pickup</li>
        </ul>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {store.name} · Powered by <Link to="/" className="font-medium text-sky-700 hover:underline">EasyCart</Link>
      </div>
    </footer>
  );
}
