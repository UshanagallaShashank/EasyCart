// Product image upload and URL input field with preview
import { useState, useRef, type ChangeEvent } from 'react';
import { Upload, Image as ImageIcon, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadStoreImage } from '@/features/stores/api/store-api';

interface Props {
  value?: string;
  onChange: (url: string) => void;
}

export function ProductImageField({ value, onChange }: Props) {
  const [showUrl, setShowUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handle_file_change(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await uploadStoreImage({ file: dataUrl, type: 'product' as any });
        onChange(res.url);
      } catch {
        onChange(dataUrl);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="p-image" className="text-xs font-semibold">Upload product image</Label>
        <button
          type="button"
          onClick={() => setShowUrl(!showUrl)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Link2 className="size-3" />
          {showUrl ? 'Hide URL' : 'Paste URL'}
        </button>
      </div>
      <input
        ref={fileRef}
        id="p-image"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handle_file_change}
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border p-2 bg-muted/20">
          <img src={value} alt="Preview" className="size-12 rounded-md object-cover border bg-background shrink-0" />
          <div className="flex flex-col gap-1 grow min-w-0">
            <span className="text-[11px] text-muted-foreground truncate">{value.startsWith('data:') ? 'Image uploaded' : value}</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="xs" onClick={() => fileRef.current?.click()} disabled={isUploading} className="h-6 text-[11px] px-2">
                <Upload className="size-3 mr-1" />
                Change
              </Button>
              <Button type="button" variant="ghost" size="xs" className="h-6 text-[11px] px-2 text-destructive hover:bg-destructive/10" onClick={() => onChange('')}>
                <Trash2 className="size-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2.5 rounded-lg border-2 border-dashed py-2 px-3 text-center cursor-pointer hover:bg-muted/15 transition-colors"
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
            {isUploading ? <Upload className="size-3.5 animate-bounce" /> : <ImageIcon className="size-3.5" />}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-slate-700">
              {isUploading ? 'Uploading image…' : 'Click to choose product image'}
            </span>
            <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP or SVG up to 10MB</span>
          </div>
        </div>
      )}
      {showUrl && (
        <Input
          type="url"
          placeholder="https://example.com/product.jpg"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs h-8"
        />
      )}
    </div>
  );
}
