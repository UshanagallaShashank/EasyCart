// Shortcut cards from the overview to the main admin areas.
import { Link } from 'react-router-dom';
import { ArrowRight, Store, Users, TrendingUp, Sprout } from 'lucide-react';

const SHORTCUTS = [
  { to: '/admin/stores', label: 'Stores', hint: 'Filter, open, suspend, export', icon: Store, tone: 'bg-sky-50 text-sky-600' },
  { to: '/admin/users', label: 'Users', hint: 'Owners, customers, admins', icon: Users, tone: 'bg-violet-50 text-violet-600' },
  { to: '/admin/insights/sales', label: 'Sales insights', hint: 'Trends, top stores, daily', icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-600' },
  { to: '/admin/insights/growth', label: 'Growth insights', hint: 'New stores, health, roles', icon: Sprout, tone: 'bg-amber-50 text-amber-600' }
];

export function AdminShortcuts() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {SHORTCUTS.map((s) => (
        <Link key={s.to} to={s.to} className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors hover:border-sky-300">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${s.tone}`}><s.icon className="size-5" /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{s.label}</span><span className="block truncate text-xs text-slate-500">{s.hint}</span></span>
          <ArrowRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500" />
        </Link>
      ))}
    </div>
  );
}
