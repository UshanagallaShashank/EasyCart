import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Trash2, Loader2, CloudCheck, Link2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
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

interface PendingUpload {
  file: File;
  dataUrl: string;
  name: string;
  size: string;
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
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      const sizeKb = (file.size / 1024).toFixed(1);
      const sizeFormatted =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${sizeKb} KB`;

      // Open confirmation modal before uploading
      setPendingUpload({
        file,
        dataUrl,
        name: file.name,
        size: sizeFormatted
      });
    };
    reader.onerror = () => {
      toast.error('Failed to read the selected file');
    };
    reader.readAsDataURL(file);
  }

  function handleConfirmUpload() {
    if (!pendingUpload) return;

    upload.mutate(
      { file: pendingUpload.dataUrl, type },
      {
        onSuccess: (data) => {
          onChange(data.url);
          onUploadSuccess?.(data.url);
          toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded to Supabase under your user ID!`);
          setPendingUpload(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : 'Failed to upload image to Supabase');
        }
      }
    );
  }

  function handleCancelUpload() {
    setPendingUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleConfirmDelete() {
    onChange('');
    onUploadSuccess?.('');
    setShowDeleteConfirm(false);
    toast.success(`Store ${type === 'logo' ? 'logo' : 'banner'} removed`);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
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
                      onClick={() => setShowDeleteConfirm(true)}
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
                      onClick={() => setShowDeleteConfirm(true)}
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

      {/* Upload Confirmation Modal */}
      <Dialog
        open={Boolean(pendingUpload)}
        onOpenChange={(open) => {
          if (!open && !upload.isPending) {
            handleCancelUpload();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-4 text-sky-600" />
              <span>Confirm {type === 'logo' ? 'Logo' : 'Banner'} Upload</span>
            </DialogTitle>
            <DialogDescription>
              Please review your selected image before uploading to Supabase.
            </DialogDescription>
          </DialogHeader>

          {pendingUpload && (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center justify-center p-3 rounded-xl border bg-slate-50/80 overflow-hidden">
                {aspect === 'square' ? (
                  <div className="size-28 rounded-lg overflow-hidden border bg-white shadow-xs flex items-center justify-center">
                    <img
                      src={pendingUpload.dataUrl}
                      alt="Upload Preview"
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-full rounded-lg overflow-hidden border bg-white shadow-xs">
                    <img
                      src={pendingUpload.dataUrl}
                      alt="Upload Preview"
                      className="size-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white p-3 text-xs flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">File name:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={pendingUpload.name}>
                    {pendingUpload.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">File size:</span>
                  <span className="font-semibold text-slate-800">{pendingUpload.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Destination:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CloudCheck className="size-3.5" />
                    Supabase Storage
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Clicking <strong>Confirm & Upload</strong> will store this image in your Supabase bucket and link it to your store.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelUpload}
              disabled={upload.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUpload}
              disabled={upload.isPending}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              {upload.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="size-3.5" />
                  Confirm & Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete / Remove Confirmation Modal */}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setShowDeleteConfirm(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4 text-destructive" />
              <span>Remove {type === 'logo' ? 'Logo' : 'Banner'}?</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your store {type === 'logo' ? 'logo' : 'banner'}?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            {value && (
              <div className="flex items-center justify-center p-3 rounded-xl border bg-slate-50/80 overflow-hidden">
                {aspect === 'square' ? (
                  <div className="size-20 rounded-lg overflow-hidden border bg-white shadow-xs">
                    <img
                      src={value}
                      alt={label}
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-24 w-full rounded-lg overflow-hidden border bg-white shadow-xs">
                    <img
                      src={value}
                      alt={label}
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                This will unlink the {type === 'logo' ? 'logo' : 'banner'} from your store and storefront. You can upload a new one at any time.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="size-3.5" />
              Yes, Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
