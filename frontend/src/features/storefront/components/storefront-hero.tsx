import type { PublicStore } from '../types/storefront-types';

export function StorefrontHero({ store }: { store: PublicStore }) {
  if (!store.banner_url) {
    return (
      <div className="bg-secondary flex h-40 items-center justify-center">
        <h1 className="font-heading text-2xl">{store.name}</h1>
      </div>
    );
  }

  return (
    <div className="relative h-56 w-full overflow-hidden">
      <img src={store.banner_url} alt={store.name} className="size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <h1 className="absolute bottom-4 left-6 font-heading text-2xl text-white">{store.name}</h1>
    </div>
  );
}
