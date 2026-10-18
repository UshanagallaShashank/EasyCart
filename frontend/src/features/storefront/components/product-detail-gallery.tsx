// Displays product images and fallbacks on the storefront product detail page.
import { Package } from 'lucide-react';

export function ProductDetailGallery({ image, name }: { image?: string; name: string }) {
  if (!image) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-xs text-slate-300">
        <Package className="size-20" />
      </div>
    );
  }

  return (
    <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <img src={image} alt={name} className="size-full object-cover" />
    </div>
  );
}
