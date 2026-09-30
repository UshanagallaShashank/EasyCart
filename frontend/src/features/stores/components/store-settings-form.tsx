// Store settings form wrapper assembling fixed header action, hero banner, branding and operations cards.
import { PageHeader } from '@/components/page-header';
import type { Store } from '../types/store-types';
import { useStoreForm } from '../hooks/use-store-form';
import { StoreHeroBanner } from './store-hero-banner';
import { StoreBrandingCard } from './store-branding-card';
import { StoreOperationsCard } from './store-operations-card';

export function StoreSettingsForm({ store }: { store: Store }) {
  const { form, set, is_dirty, isPending, handle_submit, handle_image_persist } = useStoreForm(store);

  return (
    <form onSubmit={handle_submit} className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader title="Store Settings" description="Customize your storefront appearance, delivery fees, and promotional banners.">
        <button
          type="submit"
          disabled={!is_dirty || isPending}
          className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-[#0077C8] hover:bg-[#0064AA] hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-500/20 active:translate-y-0 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isPending ? 'Saving changes…' : 'Save Store Settings'}
        </button>
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <StoreHeroBanner store={store} />
          <StoreBrandingCard form={form} onUpdate={set} onImagePersist={handle_image_persist} />
          <StoreOperationsCard form={form} onUpdate={set} />
        </div>
      </div>
    </form>
  );
}
