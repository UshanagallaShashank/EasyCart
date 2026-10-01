// A click-to-upload box for one document. Tells the page the file as a data URL (or null when removed).
import { useId, useRef, useState, type ChangeEvent } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { checkDocument, formatFileSize, readDocument, MAX_DOCUMENT_MB } from '../lib/read-document';

interface DocumentUploadBoxProps {
  label: string;
  hint: string;
  onChange: (dataUrl: string | null) => void;
}

export function DocumentUploadBox({ label, hint, onChange }: DocumentUploadBoxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  async function handleChoose(e: ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (!chosen) return;

    const problem = checkDocument(chosen);
    if (problem) {
      setError(problem);
      e.target.value = '';
      return;
    }

    setError('');
    setFile(chosen);
    onChange(await readDocument(chosen));
  }

  function handleRemove() {
    setFile(null);
    setError('');
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label} <span className="text-rose-500">*</span>
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleChoose}
        className="sr-only"
      />

      {file ? (
        <div className="flex h-24 items-center gap-3 rounded-xl border border-sky-200 bg-sky-50/60 px-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-2xs">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${label}`}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-white px-3 text-center transition-colors hover:border-sky-400 hover:bg-sky-50/40 focus-within:border-sky-500"
        >
          <UploadCloud className="size-5 text-sky-500" />
          <span className="text-xs font-medium text-slate-700">Click to upload</span>
          <span className="text-[11px] text-slate-400">{hint} · max {MAX_DOCUMENT_MB}MB</span>
        </label>
      )}

      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}
