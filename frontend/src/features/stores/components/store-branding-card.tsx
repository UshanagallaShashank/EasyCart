// Card for store identity, logo, banner, and theme selection
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoreImageField } from './store-image-field';
import type { Store, StoreSettingsPayload } from '../types/store-types';

interface Props {
  form: StoreSettingsPayload;
  onUpdate: (k: keyof StoreSettingsPayload, v: unknown) => void;
  onImagePersist?: (field: 'logo_url' | 'banner_url', url: string) => void;
}

export function StoreBrandingCard({ form, onUpdate, onImagePersist }: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow bg-white">
      <CardHeader><CardTitle className="text-base font-bold">Store Branding & Identity</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Store Name</Label>
          <Input id="name" value={form.name} onChange={(e) => onUpdate('name', e.target.value)} className="text-xs h-9 rounded-xl hover:border-slate-300 transition-colors" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <StoreImageField
            label="Store Logo"
            type="logo"
            aspect="square"
            value={form.logo_url ?? ''}
            onChange={(url) => onUpdate('logo_url', url)}
            onUploadSuccess={(url) => onImagePersist?.('logo_url', url)}
            helperText="Upload your store logo (PNG, JPG, WEBP, SVG up to 10MB)"
          />
          <StoreImageField
            label="Store Banner"
            type="banner"
            aspect="banner"
            value={form.banner_url ?? ''}
            onChange={(url) => onUpdate('banner_url', url)}
            onUploadSuccess={(url) => onImagePersist?.('banner_url', url)}
            helperText="Upload a banner image for your store (PNG, JPG, WEBP up to 10MB)"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-slate-700">Store Theme</Label>
          <Select value={form.theme} onValueChange={(v) => onUpdate('theme', v as Store['theme'])}>
            <SelectTrigger className="text-xs h-9 rounded-xl hover:border-slate-300 transition-colors"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (EasyCart Sky)</SelectItem>
              <SelectItem value="light">Light Minimal</SelectItem>
              <SelectItem value="dark">Midnight Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
