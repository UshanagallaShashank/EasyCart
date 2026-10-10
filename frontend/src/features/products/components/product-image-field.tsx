// Multiple product image upload and URL management with cover image designation
import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Upload, Image as ImageIcon, Trash2, Link2, Star, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadStoreImage } from '@/features/stores/api/store-api';

interface Props {
  values?: string[];
  value?: string;
  onChange: (urls: string[]) => void;
}

export function ProductImageField({ values, value, onChange }: Props) {
  const images = values ?? (value ? [value] : []);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handle_file_change(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsUploading(true);

    const uploadedUrls: string[] = [];
    for (const file of files) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const res = await uploadStoreImage({ file: dataUrl, type: 'product' as any });
          uploadedUrls.push(res.url);
        } catch {
          uploadedUrls.push(dataUrl);
        }
      } catch (err) {
        console.error('Failed reading file', err);
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    }
    setIsUploading(false);
    e.target.value = '';
  }

  function handle_add_url(e?: FormEvent) {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlInput('');
  }

  function handle_remove(indexToRemove: number) {
    onChange(images.filter((_, i) => i !== indexToRemove));
  }

  function handle_set_cover(indexToPromote: number) {
    if (indexToPromote === 0) return;
    const target = images[indexToPromote];
    const rest = images.filter((_, i) => i !== indexToPromote);
    onChange([target, ...rest]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold">Product Photos ({images.length})</Label>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            First photo is the cover photo on the home page
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowUrl(!showUrl)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Link2 className="size-3" />
          {showUrl ? 'Hide URL' : 'Add via URL'}
        </button>
      </div>

      <input
        ref={fileRef}
        id="p-images"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handle_file_change}
      />

      {/* Image list / gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {images.map((imgUrl, index) => {
            const isCover = index === 0;
            return (
              <div
                key={`${imgUrl}-${index}`}
                className={`group relative flex flex-col rounded-xl border overflow-hidden bg-background shadow-2xs transition-all ${
                  isCover ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`Product ${index + 1}`}
                    className="size-full object-contain p-1"
                  />
                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      <Star className="size-2.5 fill-white" />
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handle_remove(index)}
                    title="Remove photo"
                    className="absolute top-1.5 right-1.5 rounded-md bg-white/90 p-1 text-slate-500 hover:text-rose-600 hover:bg-white shadow-xs transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="p-1.5 bg-muted/20 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                    Photo {index + 1}
                  </span>
                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => handle_set_cover(index)}
                      className="text-[10px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      Set cover
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add more photo card */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 transition-all text-slate-500 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="size-5 animate-spin text-sky-600" />
            ) : (
              <Plus className="size-5 text-slate-400" />
            )}
            <span className="text-[11px] font-medium text-slate-600">
              {isUploading ? 'Uploading…' : 'Add photo'}
            </span>
          </button>
        </div>
      )}

      {/* Empty state: No photos yet */}
      {images.length === 0 && (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-6 px-4 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/20 transition-all"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            {isUploading ? <Upload className="size-5 animate-bounce" /> : <ImageIcon className="size-5" />}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-800">
              {isUploading ? 'Uploading photos…' : 'Upload product photos'}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Select one or multiple images • PNG, JPG, WEBP up to 10MB
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isUploading}
            className="mt-1 text-xs h-7 pointer-events-none"
          >
            <Upload className="size-3 mr-1" />
            Browse files
          </Button>
        </div>
      )}

      {/* Paste URL field */}
      {showUrl && (
        <div className="flex gap-2 mt-1">
          <Input
            type="url"
            placeholder="https://example.com/product-image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="text-xs h-8 grow"
          />
          <Button
            type="button"
            size="xs"
            onClick={() => handle_add_url()}
            disabled={!urlInput.trim()}
            className="h-8 text-xs"
          >
            Add URL
          </Button>
        </div>
      )}
    </div>
  );
}
