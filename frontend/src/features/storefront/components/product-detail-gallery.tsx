// Flipkart-style interactive multi-image product gallery with thumbnails and carousel controls
import { useState } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images?: string[];
  image?: string;
  name: string;
}

export function ProductDetailGallery({ images, image, name }: Props) {
  const photoList = (images && images.length > 0 ? images : image ? [image] : []).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  if (photoList.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-xs text-slate-300">
        <Package className="size-20" />
      </div>
    );
  }

  const activePhoto = photoList[activeIndex] || photoList[0];

  function prevPhoto() {
    setActiveIndex((current) => (current === 0 ? photoList.length - 1 : current - 1));
  }

  function nextPhoto() {
    setActiveIndex((current) => (current === photoList.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4 w-full">
      {/* Flipkart-style Thumbnail Column */}
      {photoList.length > 1 && (
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[420px] pb-1 sm:pb-0 shrink-0">
          {photoList.map((uri, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={`${uri}-${idx}`}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => setActiveIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative size-14 sm:size-16 rounded-xl border bg-white p-1 overflow-hidden transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-sky-600 ring-2 ring-sky-500/25 shadow-sm scale-102'
                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={uri}
                  alt={`${name} thumbnail ${idx + 1}`}
                  className="size-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Large Image Preview (Flipkart style) */}
      <div className="relative aspect-square w-full grow overflow-hidden rounded-2xl border border-slate-100 bg-white flex items-center justify-center group shadow-xs">
        <img
          src={activePhoto}
          alt={`${name} view ${activeIndex + 1}`}
          className="size-full object-contain p-4 transition-all duration-300"
        />

        {/* Navigation arrows (shown when multiple images) */}
        {photoList.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md border border-slate-200 hover:bg-white hover:scale-105 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md border border-slate-200 hover:bg-white hover:scale-105 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Photo count indicator badge (Flipkart style) */}
            <div className="absolute bottom-2.5 right-2.5 rounded-full bg-slate-900/75 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
              {activeIndex + 1} / {photoList.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
