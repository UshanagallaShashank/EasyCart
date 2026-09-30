// Store settings form wrapper assembling branding and operations cards
import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useUpdateStore } from '../hooks/use-update-store';
import { ApiError } from '@/shared/api/api-error';
import type { Store, StoreSettingsPayload } from '../types/store-types';
import { StoreBrandingCard } from './store-branding-card';
import { StoreOperationsCard } from './store-operations-card';

export function StoreSettingsForm({ store }: { store: Store }) {
  const [form, setForm] = useState<StoreSettingsPayload>({
    name: store.name,
    logo_url: store.logo_url ?? '',
    banner_url: store.banner_url ?? '',
    theme: store.theme,
    delivery_fee: store.delivery_fee,
    promotion_banner_text: store.promotion_banner_text ?? ''
  });
  const update = useUpdateStore();
  const set = (k: keyof StoreSettingsPayload, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    setForm({
      name: store.name,
      logo_url: store.logo_url ?? '',
      banner_url: store.banner_url ?? '',
      theme: store.theme,
      delivery_fee: store.delivery_fee,
      promotion_banner_text: store.promotion_banner_text ?? ''
    });
  }, [store]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    update.mutate(form, {
      onSuccess: () => toast.success('Store settings saved successfully'),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to save settings')
    });
  }

  function handleImagePersist(field: 'logo_url' | 'banner_url', url: string) {
    const nextForm = { ...form, [field]: url };
    setForm(nextForm);
    // Automatically save updated logo/banner into the Supabase stores record
    update.mutate(nextForm, {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to save settings')
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <StoreBrandingCard form={form} onUpdate={set} onImagePersist={handleImagePersist} />
      <StoreOperationsCard form={form} onUpdate={set} isPending={update.isPending} />
    </form>
  );
}
