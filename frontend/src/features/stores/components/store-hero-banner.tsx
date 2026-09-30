// Overview hero banner for store dashboard with live status and links
import { ExternalLink, Globe } from 'lucide-react';
import type { Store } from '../types/store-types';
import { PublishToggle } from './publish-toggle';

export function StoreHeroBanner({ store }: { store: Store }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 group hover:bg-sky-100/80 hover:scale-105 transition-all duration-200">
          <Globe className="w-6 h-6 text-[#0284C7] transition-transform duration-300 group-hover:rotate-12" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{store.name}</h2>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">/{store.slug}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage your public storefront, delivery rules, and branding.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <PublishToggle store={store} />
        {store.slug && (
          <a href={`/${store.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 text-white text-xs font-semibold shadow-xs transition-all duration-200 group">
            <span>View Store</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}
