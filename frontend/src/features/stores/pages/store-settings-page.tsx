// Store settings page displaying owner settings form and branding controls.
import { Skeleton } from '@/components/ui/skeleton';
import { useOwnStore } from '../hooks/use-own-store';
import { StoreSettingsForm } from '../components/store-settings-form';

export function StoreSettingsPage() {
  const { data: store, isLoading } = useOwnStore();

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (!store) return <p className="text-slate-500 text-sm">Store not found.</p>;

  return <StoreSettingsForm store={store} />;
}
