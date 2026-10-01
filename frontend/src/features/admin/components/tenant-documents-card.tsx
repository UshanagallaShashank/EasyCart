// Customer verification documents card for platform admin store detail page.
import { useState, useEffect } from 'react';
import { ExternalLink, FileText, ShieldCheck, Eye, X, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminTenantDetail, TenantDocument } from '../types/admin-types';

interface TenantDocumentsCardProps {
  detail: AdminTenantDetail;
}

export function TenantDocumentsCard({ detail }: TenantDocumentsCardProps) {
  const [activeDoc, setActiveDoc] = useState<TenantDocument | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveDoc(null);
    }
    if (activeDoc) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeDoc]);

  const docs: TenantDocument[] = detail.documents && detail.documents.length > 0
    ? detail.documents
    : [
        detail.id_proof_url
          ? {
              id: 'id-proof',
              title: 'ID Proof',
              file_name: 'id-proof',
              url: detail.id_proof_url,
              type: detail.id_proof_url.toLowerCase().includes('.pdf') ? 'pdf' : 'image'
            }
          : null,
        detail.business_proof_url
          ? {
              id: 'business-proof',
              title: 'Business Proof',
              file_name: 'business-proof',
              url: detail.business_proof_url,
              type: detail.business_proof_url.toLowerCase().includes('.pdf') ? 'pdf' : 'image'
            }
          : null
      ].filter(Boolean) as TenantDocument[];

  const isPending = detail.tenant.status === 'pending';

  // If active/suspended store and no documents ever recorded, omit the card to keep the page clean.
  if (docs.length === 0 && !isPending) {
    return null;
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Submitted Documents</h2>
              <p className="text-xs text-slate-500">
                Customer verification documents uploaded during store application
              </p>
            </div>
          </div>
          {docs.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {docs.length} {docs.length === 1 ? 'document' : 'documents'}
            </span>
          )}
        </div>

        {docs.length === 0 ? (
          <div className="flex items-center gap-3 py-6 text-sm text-amber-800 bg-amber-50/60 rounded-xl px-4 mt-4 border border-amber-200/70">
            <AlertCircle className="size-5 text-amber-600 shrink-0" />
            <p>No verification documents were attached to this pending store application.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            {docs.map((doc) => {
              const isPdf = doc.type === 'pdf' || doc.file_name.toLowerCase().endsWith('.pdf') || doc.url.toLowerCase().includes('.pdf');
              return (
                <div
                  key={doc.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/40 p-4 transition-colors hover:border-slate-300"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 shrink-0 text-sky-600" />
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {doc.title}
                        </span>
                        <span className="block truncate text-[11px] text-slate-500 font-mono">
                          {doc.file_name}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                      {isPdf ? 'PDF' : 'Image'}
                    </span>
                  </div>

                  {/* Document preview container */}
                  {isPdf ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <FileText className="size-6" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">PDF Document</p>
                        <p className="text-[11px] text-slate-500">Click below to open and review</p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-sky-700"
                      >
                        <ExternalLink className="size-3.5" /> Open PDF
                      </a>
                    </div>
                  ) : (
                    <div
                      onClick={() => setActiveDoc(doc)}
                      className="group relative flex h-56 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-900/5 transition-all hover:border-sky-300"
                      title="Click to preview full size"
                    >
                      <img
                        src={doc.url}
                        alt={doc.title}
                        className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-md">
                          <Eye className="size-3.5 text-sky-600" /> Click to enlarge
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action links */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3">
                    <span className="text-[11px] text-slate-500">
                      Private document · Signed URL
                    </span>
                    <div className="flex items-center gap-2">
                      {!isPdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveDoc(doc)}
                          className="h-7 gap-1 px-2 text-xs font-medium text-slate-700 hover:text-sky-700"
                        >
                          <Eye className="size-3.5" /> Preview
                        </Button>
                      )}
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-sky-300 hover:text-sky-700 transition-colors"
                      >
                        <ExternalLink className="size-3.5" /> View original
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox Modal for enlarged document inspection */}
      {activeDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveDoc(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-sky-600 shrink-0" />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900">{activeDoc.title}</h3>
                  <p className="truncate text-[11px] text-slate-500 font-mono">{activeDoc.file_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-700 transition-colors"
                >
                  <Download className="size-3.5" /> Open / Download
                </a>
                <button
                  type="button"
                  onClick={() => setActiveDoc(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Close document preview"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="flex max-h-[75vh] items-center justify-center overflow-auto bg-slate-950/5 p-4">
              <img
                src={activeDoc.url}
                alt={activeDoc.title}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-2.5 text-xs text-slate-500">
              <span>Customer Verification Document</span>
              <Button variant="ghost" size="sm" onClick={() => setActiveDoc(null)} className="h-7 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
