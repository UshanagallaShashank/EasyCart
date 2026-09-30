// Card for store identity, logo, banner, and theme selection
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Store, StoreSettingsPayload } from '../types/store-types';

interface Props {
  form: StoreSettingsPayload;
  onUpdate: (k: keyof StoreSettingsPayload, v: unknown) => void;
}

export function StoreBrandingCard({ form, onUpdate }: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow bg-white">
      <CardHeader><CardTitle className="text-base font-bold">Store Branding & Identity</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Store Name</Label>
          <Input id="name" value={form.name} onChange={(e) => onUpdate('name', e.target.value)} className="text-xs h-9 rounded-xl hover:border-slate-300 transition-colors" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logo_url" className="text-xs font-semibold text-slate-700">Logo URL</Label>
            <Input id="logo_url" placeholder="https://..." value={form.logo_url} onChange={(e) => onUpdate('logo_url', e.target.value)} className="text-xs h-9 rounded-xl hover:border-slate-300 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="banner_url" className="text-xs font-semibold text-slate-700">Banner URL</Label>
            <Input id="banner_url" placeholder="https://..." value={form.banner_url} onChange={(e) => onUpdate('banner_url', e.target.value)} className="text-xs h-9 rounded-xl hover:border-slate-300 transition-colors" />
          </div>
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
