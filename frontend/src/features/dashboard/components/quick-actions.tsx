// Shortcuts to the things owners do most.
import { Link } from 'react-router-dom';
import { Package, Ticket, Store } from 'lucide-react';

const ACTIONS = [
  { to: '/dashboard/products', label: 'Add a product', icon: Package },
  { to: '/dashboard/coupons', label: 'Create a coupon', icon: Ticket },
  { to: '/dashboard/store', label: 'Edit store look', icon: Store }
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/25"
        >
          <Icon className="size-3.5" /> {label}
        </Link>
      ))}
    </div>
  );
}
