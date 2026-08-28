import { Skeleton } from '@/components/ui/skeleton';
import { useOwnStore } from '../hooks/use-own-store';
import { StoreSettingsForm } from '../components/store-settings-form';
import { PublishToggle } from '../components/publish-toggle';

export function StoreSettingsPage() {
  const { data: store, isLoading } = useOwnStore();

  if (isLoading) return <Skeleton className="h-64 w-full max-w-md" />;
  if (!store) return <p className="text-muted-foreground">Store not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <PublishToggle store={store} />
      <StoreSettingsForm store={store} />
    </div>
  );
}
