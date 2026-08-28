import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateStore } from '../hooks/use-update-store';
import { ApiError } from '@/shared/api/api-error';
import type { Store, StoreSettingsPayload } from '../types/store-types';

export function StoreSettingsForm({ store }: { store: Store }) {
  const [form, setForm] = useState<StoreSettingsPayload>({
    name: store.name,
    logo_url: store.logo_url ?? '',
    banner_url: store.banner_url ?? '',
    theme: store.theme
  });
  const update = useUpdateStore();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    update.mutate(form, {
      onSuccess: () => toast.success('Store settings saved'),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to save settings')
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Store name</Label>
        <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input id="logo_url" value={form.logo_url} onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="banner_url">Banner URL</Label>
        <Input id="banner_url" value={form.banner_url} onChange={(e) => setForm((p) => ({ ...p, banner_url: e.target.value }))} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Theme</Label>
        <Select value={form.theme} onValueChange={(value) => setForm((p) => ({ ...p, theme: value as Store['theme'] }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={update.isPending}>
        {update.isPending ? 'Saving…' : 'Save settings'}
      </Button>
    </form>
  );
}
