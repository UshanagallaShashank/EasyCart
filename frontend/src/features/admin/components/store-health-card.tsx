// Store health: how many stores are live, active but unpublished, or suspended.
import { CheckCircle2, AlertTriangle, Ban } from 'lucide-react';
import { StackedShareBar } from './stacked-share-bar';
import type { AdminTenant } from '../types/admin-types';

export function StoreHealthCard({ tenants }: { tenants: AdminTenant[] }) {
  const live = tenants.filter((t) => t.status === 'active' && t.is_published).length;
  const unpublished = tenants.filter((t) => t.status === 'active' && !t.is_published).length;
  const suspended = tenants.filter((t) => t.status === 'suspended').length;
  const segments = [
    { label: 'Live', value: live, color: '#0ca30c', icon: CheckCircle2 },
    { label: 'Not published', value: unpublished, color: '#fab219', icon: AlertTriangle },
    { label: 'Suspended', value: suspended, color: '#d03b3b', icon: Ban }
  ];

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">Store health</h2>
      <p className="mt-1 mb-4 font-heading text-2xl font-bold text-slate-900 tabular-nums">{live} <span className="text-sm font-medium text-slate-500">of {tenants.length} stores live</span></p>
      <StackedShareBar segments={segments} unit="stores" />
    </section>
  );
}
