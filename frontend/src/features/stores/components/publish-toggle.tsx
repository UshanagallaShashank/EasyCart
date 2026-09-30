// Store publication status toggle with animated live status dot
import { toast } from 'sonner';
import { usePublishStore, useUnpublishStore } from '../hooks/use-publish-store';
import { ApiError } from '@/shared/api/api-error';
import type { Store } from '../types/store-types';

export function PublishToggle({ store }: { store: Store }) {
  const publish = usePublishStore();
  const unpublish = useUnpublishStore();
  const isPending = publish.isPending || unpublish.isPending;

  function toggle() {
    const mutation = store.is_published ? unpublish : publish;
    mutation.mutate(undefined, {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to update store status')
    });
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
        store.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80'
      }`}>
        <span className={`w-2 h-2 rounded-full ${store.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <span>{store.is_published ? 'Live Store' : 'Draft Mode'}</span>
      </span>
      <button onClick={toggle} disabled={isPending} className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 shadow-2xs transition-all duration-200 disabled:opacity-50">
        {isPending ? 'Updating…' : store.is_published ? 'Unpublish' : 'Publish'}
      </button>
    </div>
  );
}
