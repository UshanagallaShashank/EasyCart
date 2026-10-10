// Timeline of the newest stores joining, each with who created it and its current state.
import { Link } from 'react-router-dom';
import { Store, Ban, Globe } from 'lucide-react';
import type { AdminTenant } from '../types/admin-types';

function describe_relative(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 1440)} d ago`;
}

export function ActivityFeed({ tenants }: { tenants: AdminTenant[] }) {
  const recent = [...tenants].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-slate-900">Recently joined</h2>
      {!recent.length ? <p className="py-8 text-center text-sm text-slate-500">Nothing yet.</p> : (
        <ol className="relative mt-4 ml-3 border-l border-slate-200">
          {recent.map((t) => {
            const Icon = t.status === 'suspended' ? Ban : t.is_published ? Globe : Store;
            const state = t.status === 'suspended' ? 'suspended' : t.is_published ? 'live' : 'not published';
            return (
              <li key={t.id} className="relative pb-4 pl-6 last:pb-0">
                <span className="absolute top-0 -left-3 flex size-6 items-center justify-center rounded-full bg-white ring-1 ring-slate-200"><Icon className="size-3.5 text-slate-500" /></span>
                <p className="text-sm text-slate-700"><Link to={`/admin/stores/${t.id}`} className="font-semibold text-slate-900 hover:text-sky-700">{t.name}</Link> joined</p>
                <p className="text-xs text-slate-500">{describe_relative(t.created_at)}{t.owner_username ? ` · by ${t.owner_username}` : ''} · now {state}</p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
