// Card for delivery fees and storefront announcement banner
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StoreSettingsPayload } from '../types/store-types';

interface Props {
  form: StoreSettingsPayload;
  onUpdate: (k: keyof StoreSettingsPayload, v: unknown) => void;
}

export function StoreOperationsCard({ form, onUpdate }: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow bg-white">
      <CardHeader><CardTitle className="text-base font-bold">Delivery & Announcements</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delivery_fee" className="text-xs font-semibold text-slate-700">Standard Delivery Fee (Rs.)</Label>
          <Input id="delivery_fee" type="number" min={0} step="0.01" placeholder="0.00" value={form.delivery_fee === 0 ? '' : form.delivery_fee} onChange={(e) => onUpdate('delivery_fee', e.target.value === '' ? 0 : Number(e.target.value))} className="text-xs h-9 rounded-xl max-w-xs hover:border-slate-300 transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="promotion_banner_text" className="text-xs font-semibold text-slate-700">Storefront Announcement Banner</Label>
          <Textarea id="promotion_banner_text" value={form.promotion_banner_text} onChange={(e) => onUpdate('promotion_banner_text', e.target.value)} placeholder="e.g. Free delivery on orders over Rs. 50 this weekend!" className="text-xs rounded-xl hover:border-slate-300 transition-colors" rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}
