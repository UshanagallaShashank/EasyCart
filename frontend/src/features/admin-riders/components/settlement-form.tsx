// Records cash a rider handed in, or a payout made to them.
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError } from '@/shared/api/api-error';
import { format_price } from '@/lib/format-price';
import { recordSettlement } from '@/features/delivery/api/admin-rider-api';
import type { RiderMoney } from '@/features/delivery/types/delivery-types';
import { useAdminRiderAction } from '../hooks/use-admin-riders';

type Kind = 'cash_deposit' | 'payout';

export function SettlementForm({ riderId, summary }: { riderId: string; summary: RiderMoney }) {
  const [kind, setKind] = useState<Kind>('cash_deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const record = useAdminRiderAction(riderId, (payload: { kind: Kind; amount: number; note?: string }) => recordSettlement(riderId, payload));
  const suggested = kind === 'cash_deposit' ? summary.cash_in_hand : summary.payout_due;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    record.mutate({ kind, amount: Number(amount), note: note.trim() || undefined }, {
      onSuccess: () => { toast.success(kind === 'cash_deposit' ? 'Cash deposit recorded' : 'Payout recorded'); setAmount(''); setNote(''); },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not record it')
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="cash_deposit">Cash handed in by rider</SelectItem><SelectItem value="payout">Payout to rider</SelectItem></SelectContent>
        </Select>
        <Input type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
      </div>
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note, e.g. UPI ref or receipt no. (optional)" maxLength={200} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {suggested > 0 ? <button type="button" onClick={() => setAmount(String(suggested))} className="text-left text-xs font-semibold text-sky-600 hover:underline">Use {kind === 'cash_deposit' ? 'cash in hand' : 'payout due'}: {format_price(suggested)}</button> : <span />}
        <Button type="submit" disabled={!amount || record.isPending}>{record.isPending ? 'Saving…' : 'Record'}</Button>
      </div>
    </form>
  );
}
