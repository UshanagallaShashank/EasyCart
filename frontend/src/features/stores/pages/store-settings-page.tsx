// Store settings page with hero banner and configuration cards
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { useOwnStore } from '../hooks/use-own-store';
import { StoreHeroBanner } from '../components/store-hero-banner';
import { StoreSettingsForm } from '../components/store-settings-form';

export function StoreSettingsPage() {
  const { data: store, isLoading } = useOwnStore();

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (!store) return <p className="text-slate-500 text-sm">Store not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Store Settings" description="Customize your storefront appearance, delivery fees, and promotional banners." />
      <StoreHeroBanner store={store} />
      <StoreSettingsForm store={store} />
    </div>
  );
}
