import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Trash2, Loader2, CloudCheck, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useUploadStoreImage } from '../hooks/use-upload-store-image';
import { ApiError } from '@/shared/api/api-error';

interface StoreImageFieldProps {
  label: string;
  type: 'logo' | 'banner';
  value: string;
  onChange: (url: string) => void;
  onUploadSuccess?: (url: string) => void;
  helperText?: string;
  aspect?: 'square' | 'banner';
}

export function StoreImageField({
  label,
  type,
  value,
  onChange,
  onUploadSuccess,
  helperText,
  aspect = 'square'
}: StoreImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const upload = useUploadStoreImage();

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file (PNG, JPG, WEBP, GIF, SVG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      upload.mutate(
        { file: dataUrl, type },
        {
          onSuccess: (data) => {
            onChange(data.url);
            onUploadSuccess?.(data.url);
            toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded to Supabase under your user ID!`);
          },
          onError: (err) => {
            toast.error(err instanceof ApiError ? err.message : 'Failed to upload image to Supabase');
          }
        }
      );
    };
    reader.onerror = () => {
      toast.error('Failed to read the selected file');
    };
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      // Reset input value so re-selecting the same file triggers change
      e.target.value = '';
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-sm">{label}</Label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link2 className="size-3" />
          {showUrlInput ? 'Hide URL' : 'Edit URL'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
        disabled={upload.isPending}
      />

      {value ? (
        <div className="flex flex-col gap-2">
          <div className="relative group rounded-lg border border-border/70 bg-muted/20 p-2 overflow-hidden">
            {aspect === 'square' ? (
              <div className="flex items-center gap-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-md border bg-background shadow-xs">
                  <img
                    src={value}
                    alt={label}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5 grow">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CloudCheck className="size-3.5" />
                    <span>Stored in Supabase</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[240px]" title={value}>
                    {value.split('/').pop()}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={upload.isPending}
                    >
                      {upload.isPending ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        onChange('');
                        onUploadSuccess?.('');
                      }}
                      disabled={upload.isPending}
                    >
                      <Trash2 className="size-3" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="h-28 w-full overflow-hidden rounded-md border bg-background shadow-xs">
                  <img
                    src={value}
                    alt={label}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                    }}
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CloudCheck className="size-3.5" />
                    <span>Stored in Supabase</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={upload.isPending}
                    >
                      {upload.isPending ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        onChange('');
                        onUploadSuccess?.('');
                      }}
                      disabled={upload.isPending}
                    >
                      <Trash2 className="size-3" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {upload.isPending && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-xs font-medium">Uploading to Supabase...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !upload.isPending && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/10'
          } ${aspect === 'banner' ? 'h-28' : 'h-24'}`}
        >
          {upload.isPending ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Uploading to Supabase under your user ID...</span>
            </div>
          ) : (
            <>
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {aspect === 'banner' ? <ImageIcon className="size-4" /> : <Upload className="size-4" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  Click to upload or drag & drop {type === 'logo' ? 'logo' : 'banner'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {helperText ?? 'PNG, JPG, WEBP or SVG up to 10MB'}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {showUrlInput && (
        <div className="mt-1 flex flex-col gap-1">
          <Input
            id={`${type}_url`}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`https://...`}
            className="text-xs"
          />
          <span className="text-[11px] text-muted-foreground">
            Direct image URL saved in Supabase
          </span>
        </div>
      )}
    </div>
  );
}
