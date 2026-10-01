// Product image viewer with a main image and selectable thumbnails.
import { useState } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductDetailGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-slate-100 text-slate-300">
        <Package className="size-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square w-full overflow-hidden rounded-3xl bg-slate-100">
        <img src={current} alt={name} className="size-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {images.map((src, i) => (
            <button key={src + i} type="button" aria-label={`Show image ${i + 1}`} onClick={() => setActive(i)} className={cn('size-16 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:size-20', i === active ? 'ring-sky-500' : 'ring-transparent opacity-70 hover:opacity-100')}>
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
