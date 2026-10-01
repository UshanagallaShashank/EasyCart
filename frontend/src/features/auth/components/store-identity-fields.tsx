// Store name and store link inputs; the link is suggested from the name as the owner types.
import { Store, Link2 } from 'lucide-react';
import { AuthTextField } from './auth-text-field';

interface Props {
  storeName: string;
  slug: string;
  onUpdate: (key: 'store_name' | 'slug', val: string) => void;
}

function to_slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function StoreIdentityFields({ storeName, slug, onUpdate }: Props) {
  function handle_name_change(name: string) {
    onUpdate('store_name', name);
    onUpdate('slug', to_slug(name));
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AuthTextField id="store_name" label="Store name" icon={Store} value={storeName} onChange={handle_name_change} placeholder="Luna Pottery" />
      <AuthTextField
        id="slug"
        label="Store link"
        icon={Link2}
        value={slug}
        onChange={(v) => onUpdate('slug', to_slug(v))}
        placeholder="luna-pottery"
        hint={<span className="break-all">{window.location.host}/<b className="font-semibold text-slate-700">{slug || 'your-store'}</b></span>}
      />
    </div>
  );
}
