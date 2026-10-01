// Shortcuts to the things owners do most.
import { Link } from 'react-router-dom';
import { Package, Ticket, Palette } from 'lucide-react';

const ACTIONS = [
  { to: '/dashboard/products', label: 'Add product', icon: Package },
  { to: '/dashboard/coupons', label: 'New coupon', icon: Ticket },
  { to: '/dashboard/store', label: 'Customize store', icon: Palette }
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-sky-300 hover:text-sky-700">
          <Icon className="size-4 text-slate-400" /> {label}
        </Link>
      ))}
    </div>
  );
}
