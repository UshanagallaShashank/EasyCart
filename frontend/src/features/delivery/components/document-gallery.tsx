// Grid of private documents: photos open in a lightbox, PDFs open in a new tab. Links expire after an hour.
import { useEffect, useState } from 'react';
import { ExternalLink, Eye, FileText, X } from 'lucide-react';
import { resolveApiFileUrl } from '@/shared/api/api-client';
import type { RiderDocument } from '../types/delivery-types';

export function DocumentGallery({ documents, emptyMessage = 'No documents uploaded.' }: { documents: RiderDocument[]; emptyMessage?: string }) {
  const [active, setActive] = useState<RiderDocument | null>(null);

  useEffect(() => {
    if (!active) return;
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [active]);

  if (documents.length === 0) return <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">{emptyMessage}</p>;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {documents.map((doc) => {
          const src = resolveApiFileUrl(doc.url);
          return (
            <div key={`${doc.kind}-${doc.index ?? 0}`} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
              {doc.type === 'image' && src ? (
                <button type="button" onClick={() => setActive(doc)} className="group relative h-32 overflow-hidden bg-slate-100" aria-label={`Preview ${doc.title}`}>
                  <img src={src} alt={doc.title} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100"><Eye className="size-5 text-white" /></span>
                </button>
              ) : (
                <a href={src ?? '#'} target="_blank" rel="noreferrer" className="flex h-32 flex-col items-center justify-center gap-1.5 bg-rose-50/50 text-rose-600">
                  <FileText className="size-7" /><span className="text-[11px] font-semibold">Open PDF</span>
                </a>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-2.5 py-2">
                <p className="min-w-0 truncate text-xs font-semibold text-slate-800" title={doc.title}>{doc.title}</p>
                {src && <a href={src} target="_blank" rel="noreferrer" aria-label={`Open ${doc.title}`} className="shrink-0 text-slate-400 hover:text-sky-600"><ExternalLink className="size-3.5" /></a>}
              </div>
            </div>
          );
        })}
      </div>

      {active && (
        <div role="dialog" aria-modal="true" aria-label={active.title} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" onClick={() => setActive(null)}>
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{active.title}</p>
              <button type="button" onClick={() => setActive(null)} aria-label="Close preview" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-3">
              <img src={resolveApiFileUrl(active.url) ?? ''} alt={active.title} className="max-h-[78vh] max-w-full rounded-lg object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
