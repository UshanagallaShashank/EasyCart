// Vertical navigation sidebar with smooth on-hover sliding animations
import { Link, useLocation } from 'react-router-dom';
import { Store, Tags, Package, ClipboardList, Users, Ticket } from 'lucide-react';

const LINKS = [
  { to: '/dashboard/store', label: 'Store', icon: Store },
  { to: '/dashboard/categories', label: 'Categories', icon: Tags },
  { to: '/dashboard/products', label: 'Products', icon: Package },
  { to: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/coupons', label: 'Coupons', icon: Ticket }
];

export function DashboardNav() {
  const { pathname } = useLocation();

  return (
    <nav className="w-56 shrink-0 h-full border-r border-slate-200 bg-white/80 backdrop-blur-sm p-4 flex flex-col justify-between overflow-y-auto">
      <ul className="flex flex-col gap-1.5">
        {LINKS.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <li key={to}>
              <Link to={to} className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                active ? 'bg-sky-50 text-[#0284C7] font-semibold border-r-2 border-[#0284C7] shadow-xs translate-x-0.5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-1 font-medium'
              }`}>
                <Icon className={`w-4 h-4 transition-all duration-200 ${active ? 'text-[#0284C7] scale-105' : 'text-slate-400 group-hover:text-[#0284C7] group-hover:scale-110'}`} />
                <span className="transition-colors duration-200">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">EasyCart &copy; 2026</div>
    </nav>
  );
}
