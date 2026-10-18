// At the door: the customer's 6-digit code, a photo of the handover and the exact cash collected, all required.
import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Camera, CheckCircle2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format_price } from '@/lib/format-price';
import { ApiError } from '@/shared/api/api-error';
import { completeDelivery } from '@/features/delivery/api/rider-api';
import { fileToUploadDataUrl } from '@/features/delivery/lib/compress-image';
import type { RiderOrder } from '@/features/delivery/types/delivery-types';
import { useRiderOrderMutation } from '../hooks/use-rider-queries';
import { CodeInput } from './code-input';
import { FormSection } from './form-section';

export function DeliverStep({ order }: { order: RiderOrder }) {
  const photoId = useId();
  const [code, setCode] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [cash, setCash] = useState('');
  const deliver = useRiderOrderMutation((payload: { delivery_code: string; cash_collected: number; photo: string }) => completeDelivery(order.id, payload));
  const cashMatches = Math.abs(Number(cash || -1) - order.cash_to_collect) < 0.01;
  const ready = code.length === 6 && photo !== null && cashMatches;

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) setPhoto(await fileToUploadDataUrl(file));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!photo) return;
    deliver.mutate({ delivery_code: code, cash_collected: Number(cash), photo }, {
      onSuccess: () => toast.success('Delivered. Great job!'),
      onError: (err) => { setCode(''); toast.error(err instanceof ApiError ? err.message : 'Could not complete the delivery'); }
    });
  }

  return (
    <FormSection icon={CheckCircle2} title="Hand over the order" description="Only hand it over once the customer gives you their code.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="delivery-code" className="text-xs font-semibold text-slate-700">1. Customer's 6-digit delivery code</Label>
          <CodeInput id="delivery-code" label="Delivery code" length={6} value={code} onChange={setCode} />
          <p className="text-xs text-slate-500">The customer sees it on their order page. {order.delivery_attempts_left} {order.delivery_attempts_left === 1 ? 'try' : 'tries'} left.</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">2. Photo at the door</span>
          <input id={photoId} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhoto} />
          {photo ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              <img src={photo} alt="Delivery proof preview" className="h-52 w-full object-cover" />
              <label htmlFor={photoId} className="absolute right-2 bottom-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-md"><RefreshCcw className="size-3.5" /> Retake</label>
            </div>
          ) : (
            <label htmlFor={photoId} className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 text-sky-700 hover:bg-sky-50">
              <Camera className="size-7" /><span className="text-sm font-semibold">Take photo</span><span className="text-[11px] text-sky-600/80">Show the package at the customer's door</span>
            </label>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="cash" className="text-xs font-semibold text-slate-700">3. Cash collected</Label>
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Collect exactly <strong className="tabular-nums">{format_price(order.cash_to_collect)}</strong>{order.cash_to_collect === 0 && ' (order already paid)'}.</div>
          <Input id="cash" type="number" inputMode="decimal" step="0.01" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="Type the amount you received" className="h-11 text-base" />
          {cash !== '' && !cashMatches && <p className="text-xs font-medium text-rose-600">This must match {format_price(order.cash_to_collect)}.</p>}
        </div>

        <Button type="submit" size="lg" disabled={!ready || deliver.isPending} className="h-12 text-base">{deliver.isPending ? 'Completing…' : 'Mark as delivered'}</Button>
      </form>
    </FormSection>
  );
}
