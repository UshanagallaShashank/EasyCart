// The photo the rider took at the door, with the cash they confirmed collecting.
import { Camera } from 'lucide-react';
import { resolveApiFileUrl } from '@/shared/api/api-client';
import { format_price } from '@/lib/format-price';

export function ProofPhoto({ url, cashCollected }: { url: string | null; cashCollected: number | null }) {
  const src = resolveApiFileUrl(url);
  return (
    <div className="flex flex-col gap-2">
      {src ? (
        <a href={src} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-slate-200">
          <img src={src} alt="Delivery proof" className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-105" loading="lazy" />
        </a>
      ) : (
        <div className="flex h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400"><Camera className="size-4" /> No photo</div>
      )}
      {cashCollected !== null && (
        <p className="text-xs text-slate-600">Cash collected by rider: <strong className="font-semibold text-slate-900 tabular-nums">{format_price(cashCollected)}</strong></p>
      )}
    </div>
  );
}
