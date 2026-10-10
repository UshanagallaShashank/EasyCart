// Store name and live URL slug input fields
import { Store, Globe } from 'lucide-react';

interface Props {
  storeName: string;
  slug: string;
  onUpdate: (key: 'store_name' | 'slug', val: string) => void;
}

export function StoreIdentityFields({ storeName, slug, onUpdate }: Props) {
  function handleNameChange(name: string) {
    onUpdate('store_name', name);
    onUpdate('slug', name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  }

  return (
    <div className="space-y-2.5">
      <div className="relative flex items-center">
        <Store className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="store_name"
          type="text"
          value={storeName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Store Name (e.g. Luna Pottery)"
          required
          className="w-full text-xs h-10 pl-10 pr-3.5 rounded-xl bg-slate-100/80 border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>
      <div className="relative flex items-center">
        <Globe className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => onUpdate('slug', e.target.value)}
          placeholder="store-slug"
          required
          className="w-full text-xs h-10 pl-10 pr-28 rounded-xl bg-slate-100/80 border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-mono"
        />
        <span className="absolute right-3 text-[11px] text-slate-400 font-mono pointer-events-none">.easycart.shop</span>
      </div>
    </div>
  );
}
