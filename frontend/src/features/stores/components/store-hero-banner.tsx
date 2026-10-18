// Store status card at the top of settings: name, link, publish toggle, and a link to the live store.
import { ExternalLink, Globe } from 'lucide-react';
import type { Store } from '../types/store-types';
import { PublishToggle } from './publish-toggle';

export function StoreHeroBanner({ store }: { store: Store }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Globe className="size-6" /></span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-slate-900">{store.name}</h2>
          <p className="truncate font-mono text-xs text-slate-500">{window.location.host}/{store.slug}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 md:border-0 md:pt-0">
        <PublishToggle store={store} />
        <a href={`/${store.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-700">
          View store <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
