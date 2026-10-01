// How the platform's accounts split between store owners, customers, and admins.
import { StackedShareBar } from './stacked-share-bar';
import type { PlatformStats } from '../types/admin-types';

export function UserMixCard({ totals }: { totals: PlatformStats['totals'] }) {
  const segments = [
    { label: 'Customers', value: totals.customers, color: '#2a78d6' },
    { label: 'Store owners', value: totals.owners, color: '#eb6834' },
    { label: 'Admins', value: totals.admins, color: '#1baf7a' }
  ];

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">Users by role</h2>
      <p className="mt-1 mb-4 font-heading text-2xl font-bold text-slate-900 tabular-nums">{totals.customers + totals.owners + totals.admins} <span className="text-sm font-medium text-slate-500">accounts</span></p>
      <StackedShareBar segments={segments} unit="accounts" />
    </section>
  );
}
