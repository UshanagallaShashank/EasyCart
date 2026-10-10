// Up to three optional extra documents, each with a short name, e.g. a police verification letter.
import { useId, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/shared/api/api-error';
import { resolveApiFileUrl } from '@/shared/api/api-client';
import { removeOtherDocument, uploadDocument } from '@/features/delivery/api/rider-api';
import { fileToUploadDataUrl } from '@/features/delivery/lib/compress-image';
import type { RiderDocument } from '@/features/delivery/types/delivery-types';
import { useRiderProfileMutation } from '../hooks/use-rider-queries';

const MAX_OTHER = 3;

export function OtherDocuments({ documents, canRemove }: { documents: RiderDocument[]; canRemove: boolean }) {
  const inputId = useId();
  const [label, setLabel] = useState('');
  const upload = useRiderProfileMutation(uploadDocument);
  const remove = useRiderProfileMutation(removeOtherDocument);

  async function handleChoose(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    upload.mutate({ kind: 'other', file: await fileToUploadDataUrl(file), label: label.trim() || file.name.slice(0, 60) }, {
      onSuccess: () => { setLabel(''); toast.success('Document added'); },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Upload failed')
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((doc) => (
        <div key={doc.index} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <FileText className="size-4 shrink-0 text-sky-600" />
          <a href={resolveApiFileUrl(doc.url) ?? '#'} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 hover:text-sky-700">{doc.title}</a>
          {canRemove && (
            <button type="button" aria-label={`Remove ${doc.title}`} disabled={remove.isPending} onClick={() => remove.mutate(doc.index ?? 0)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
          )}
        </div>
      ))}
      {documents.length < MAX_OTHER && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Document name, e.g. Police verification" maxLength={60} className="sm:flex-1" />
          <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={handleChoose} disabled={upload.isPending} />
          <label htmlFor={inputId} className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-2xs hover:border-sky-300 hover:text-sky-700">
            <Plus className="size-4" /> {upload.isPending ? 'Uploading…' : 'Add document'}
          </label>
        </div>
      )}
    </div>
  );
}
