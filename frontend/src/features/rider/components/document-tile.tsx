// One document slot: shows what was uploaded (or a big upload button) and replaces it on a new upload.
// Photos open the camera directly on phones.
import { useId, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Camera, CheckCircle2, FileText, Loader2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/shared/api/api-error';
import { resolveApiFileUrl } from '@/shared/api/api-client';
import { uploadDocument } from '@/features/delivery/api/rider-api';
import { fileToUploadDataUrl } from '@/features/delivery/lib/compress-image';
import { DOCUMENT_INFO } from '@/features/delivery/lib/delivery-labels';
import type { DocumentKind, RiderDocument } from '@/features/delivery/types/delivery-types';
import { useRiderProfileMutation } from '../hooks/use-rider-queries';

const MAX_MB = 3;

export function DocumentTile({ kind, current, disabled }: { kind: DocumentKind; current: RiderDocument | undefined; disabled?: boolean }) {
  const info = DOCUMENT_INFO[kind];
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);
  const upload = useRiderProfileMutation(uploadDocument);
  const busy = isReading || upload.isPending;
  const preview = current?.type === 'image' ? resolveApiFileUrl(current.url) : null;

  async function handleChoose(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) return toast.error('That file is too large. Choose one under 12MB.');
    setIsReading(true);
    try {
      const dataUrl = await fileToUploadDataUrl(file);
      if (dataUrl.length * 0.75 > MAX_MB * 1024 * 1024) return toast.error(`File must be ${MAX_MB}MB or smaller after compression. Try a photo instead of a PDF.`);
      upload.mutate({ kind, file: dataUrl }, {
        onSuccess: () => toast.success(`${info.title} uploaded`),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Upload failed')
      });
    } finally {
      setIsReading(false);
    }
  }

  return (
    <div className={cn('flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white transition-colors', current ? 'border-emerald-200' : 'border-slate-200')}>
      <input ref={inputRef} id={inputId} type="file" className="sr-only" disabled={disabled || busy} onChange={handleChoose}
        accept={info.photoOnly ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,application/pdf'}
        {...(info.photoOnly ? { capture: kind === 'partner_photo' ? 'user' : 'environment' } : {})} />
      <label htmlFor={inputId} className={cn('relative flex h-32 items-center justify-center overflow-hidden', disabled ? 'cursor-not-allowed' : 'cursor-pointer', current ? 'bg-slate-50' : 'bg-sky-50/40 hover:bg-sky-50')}>
        {busy ? <Loader2 className="size-6 animate-spin text-sky-500" />
          : preview ? <img src={preview} alt={info.title} className="size-full object-cover" />
          : current ? <FileText className="size-8 text-rose-500" />
          : <span className="flex flex-col items-center gap-1 text-sky-600">{info.photoOnly ? <Camera className="size-6" /> : <UploadCloud className="size-6" />}<span className="text-xs font-semibold">{info.photoOnly ? 'Take photo' : 'Upload'}</span></span>}
        {current && !busy && <CheckCircle2 className="absolute top-2 right-2 size-5 rounded-full bg-white text-emerald-500" />}
      </label>
      <div className="flex flex-col gap-0.5 border-t border-slate-100 px-3 py-2.5">
        <p className="truncate text-xs font-semibold text-slate-900">{info.title}{info.required && <span className="text-rose-500"> *</span>}</p>
        <p className="truncate text-[11px] text-slate-500" title={info.hint}>{current && !disabled ? 'Tap the picture to replace' : info.hint}</p>
      </div>
    </div>
  );
}
