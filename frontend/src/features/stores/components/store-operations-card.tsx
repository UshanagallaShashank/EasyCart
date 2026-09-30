// Card for delivery fees and storefront announcement banner
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StoreSettingsPayload } from '../types/store-types';

interface Props {
  form: StoreSettingsPayload;
  onUpdate: (k: keyof StoreSettingsPayload, v: unknown) => void;
  isPending: boolean;
}

export function StoreOperationsCard({ form, onUpdate, isPending }: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow bg-white">
      <CardHeader><CardTitle className="text-base font-bold">Delivery & Announcements</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delivery_fee" className="text-xs font-semibold text-slate-700">Standard Delivery Fee (Rs.)</Label>
          <Input id="delivery_fee" type="number" min={0} step="0.01" value={form.delivery_fee} onChange={(e) => onUpdate('delivery_fee', Number(e.target.value))} className="text-xs h-9 rounded-xl max-w-xs hover:border-slate-300 transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="promotion_banner_text" className="text-xs font-semibold text-slate-700">Storefront Announcement Banner</Label>
          <Textarea id="promotion_banner_text" value={form.promotion_banner_text} onChange={(e) => onUpdate('promotion_banner_text', e.target.value)} placeholder="e.g. Free delivery on orders over Rs. 50 this weekend!" className="text-xs rounded-xl hover:border-slate-300 transition-colors" rows={3} />
        </div>
        <button type="submit" disabled={isPending} className="w-full sm:w-auto px-5 h-9 rounded-xl bg-[#0077C8] hover:bg-[#0064AA] hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-500/20 active:translate-y-0 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-200 disabled:opacity-50">
          {isPending ? 'Saving changes…' : 'Save Store Settings'}
        </button>
      </CardContent>
    </Card>
  );
}
