// Clickable counts of what needs an admin's attention, each linking to the matching filtered list.
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, EyeOff, Ban, Sparkles } from 'lucide-react';
import type { AdminTenant, PlatformStats } from '../types/admin-types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function ActionTiles({ tenants, totals }: { tenants: AdminTenant[]; totals?: PlatformStats['totals'] }) {
  const tiles = [
    { label: 'Pending orders', value: totals?.pending_orders, hint: 'Waiting on store owners', to: '/admin/insights/sales', icon: Clock, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Not published', value: tenants.filter((t) => t.status === 'active' && !t.is_published).length, hint: 'Stores not visible yet', to: '/admin/stores?status=unpublished', icon: EyeOff, tone: 'text-sky-600 bg-sky-50' },
    { label: 'Suspended', value: tenants.filter((t) => t.status === 'suspended').length, hint: 'Review or reactivate', to: '/admin/stores?status=suspended', icon: Ban, tone: 'text-rose-600 bg-rose-50' },
    { label: 'New this week', value: tenants.filter((t) => Date.now() - new Date(t.created_at).getTime() < WEEK_MS).length, hint: 'Stores created in 7 days', to: '/admin/insights/growth', icon: Sparkles, tone: 'text-emerald-600 bg-emerald-50' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {tiles.map((t) => (
        <Link key={t.label} to={t.to} className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors hover:border-sky-300 sm:p-5">
          <span className={`flex size-10 items-center justify-center rounded-xl ${t.tone}`}><t.icon className="size-5" /></span>
          <p className="mt-4 font-heading text-3xl font-bold text-slate-900 tabular-nums">{t.value ?? '…'}</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{t.label}</p>
          <p className="mt-0.5 flex items-center justify-between gap-2 text-xs text-slate-500">{t.hint}<ArrowRight className="size-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500" /></p>
        </Link>
      ))}
    </div>
  );
}
