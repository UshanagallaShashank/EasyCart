// Store settings form: header with save, store status card, branding and operations cards, unsaved-changes bar.
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { UnsavedChangesBar } from '@/components/unsaved-changes-bar';
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning';
import type { Store } from '../types/store-types';
import { useStoreForm } from '../hooks/use-store-form';
import { StoreHeroBanner } from './store-hero-banner';
import { StoreBrandingCard } from './store-branding-card';
import { StoreOperationsCard } from './store-operations-card';
import { StorePickupLocationCard } from './store-pickup-location-card';

export function StoreSettingsForm({ store }: { store: Store }) {
  const { form, set, is_dirty, isPending, handle_submit, handle_image_persist, reset_form } = useStoreForm(store);
  useUnsavedChangesWarning(is_dirty);

  return (
    <form onSubmit={handle_submit} className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Store settings" description="Branding, delivery fee, and the announcement shown on your storefront.">
        <Button type="submit" size="lg" disabled={!is_dirty || isPending} className="hidden md:inline-flex">{isPending ? 'Saving…' : 'Save changes'}</Button>
      </PageHeader>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-8">
          <StoreHeroBanner store={store} />
          <StoreBrandingCard form={form} onUpdate={set} onImagePersist={handle_image_persist} />
          <StoreOperationsCard form={form} onUpdate={set} />
          <StorePickupLocationCard form={form} onUpdate={set} />
        </div>
        <UnsavedChangesBar visible={is_dirty} isSaving={isPending} onDiscard={reset_form} />
      </div>
    </form>
  );
}
