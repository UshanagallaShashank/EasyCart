// Custom hook managing store settings form state, image persistence, and submissions.
import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/api-error';
import { useUpdateStore } from './use-update-store';
import type { Store, StoreSettingsPayload } from '../types/store-types';

function to_form_values(store: Store): StoreSettingsPayload {
  return {
    name: store.name,
    logo_url: store.logo_url ?? '',
    banner_url: store.banner_url ?? '',
    theme: store.theme,
    delivery_fee: store.delivery_fee,
    promotion_banner_text: store.promotion_banner_text ?? ''
  };
}

export function useStoreForm(store: Store) {
  const [form, setForm] = useState<StoreSettingsPayload>(() => to_form_values(store));
  const update = useUpdateStore();
  const set_field = (k: keyof StoreSettingsPayload, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    setForm(to_form_values(store));
  }, [store]);

  const is_dirty =
    form.name !== store.name ||
    (form.logo_url || '') !== (store.logo_url || '') ||
    (form.banner_url || '') !== (store.banner_url || '') ||
    form.theme !== store.theme ||
    Number(form.delivery_fee) !== Number(store.delivery_fee) ||
    (form.promotion_banner_text || '') !== (store.promotion_banner_text || '');

  function handle_submit(e: FormEvent) {
    e.preventDefault();
    update.mutate(form, {
      onSuccess: () => toast.success('Store settings saved successfully'),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to save settings')
    });
  }

  function handle_image_persist(field: 'logo_url' | 'banner_url', url: string) {
    const next = { ...form, [field]: url };
    setForm(next);
    update.mutate(next, { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to save settings') });
  }

  return { form, set: set_field, is_dirty, isPending: update.isPending, handle_submit, handle_image_persist, reset_form: () => setForm(to_form_values(store)) };
}
