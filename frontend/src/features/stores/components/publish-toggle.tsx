import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublishStore, useUnpublishStore } from '../hooks/use-publish-store';
import { ApiError } from '@/shared/api/api-error';
import type { Store } from '../types/store-types';

export function PublishToggle({ store }: { store: Store }) {
  const publish = usePublishStore();
  const unpublish = useUnpublishStore();

  function toggle() {
    const mutation = store.is_published ? unpublish : publish;
    mutation.mutate(undefined, {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to update store status')
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant={store.is_published ? 'default' : 'secondary'}>
        {store.is_published ? 'Published' : 'Draft'}
      </Badge>
      <Button variant="outline" onClick={toggle} disabled={publish.isPending || unpublish.isPending}>
        {store.is_published ? 'Unpublish' : 'Publish'}
      </Button>
    </div>
  );
}
