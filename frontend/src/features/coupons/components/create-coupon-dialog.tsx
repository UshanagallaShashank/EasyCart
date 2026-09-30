import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateCoupon } from '../hooks/use-create-coupon';
import { ApiError } from '@/shared/api/api-error';
import type { CouponPayload } from '../types/coupon-types';

const EMPTY_FORM: CouponPayload = { code: '', discount_type: 'flat', discount_value: 0, expires_at: null };

export function CreateCouponDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CouponPayload>(EMPTY_FORM);
  const create = useCreateCoupon();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm(EMPTY_FORM);
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to create coupon')
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New coupon</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New coupon</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="coupon-code">Code</Label>
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g. SAVE10"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Discount type</Label>
              <Select
                value={form.discount_type}
                onValueChange={(value) => setForm((p) => ({ ...p, discount_type: value as CouponPayload['discount_type'] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat amount</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="coupon-value">{form.discount_type === 'percent' ? 'Percent off' : 'Amount off ($)'}</Label>
              <Input
                id="coupon-value"
                type="number"
                min={0}
                max={form.discount_type === 'percent' ? 100 : undefined}
                step="0.01"
                value={form.discount_value}
                onChange={(e) => setForm((p) => ({ ...p, discount_value: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="coupon-expires-at">Expiry date</Label>
              <Input
                id="coupon-expires-at"
                type="date"
                value={form.expires_at ? form.expires_at.split('T')[0] : ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    expires_at: e.target.value ? new Date(`${e.target.value}T23:59:59.999Z`).toISOString() : null
                  }))
                }
              />
              <span className="text-[11px] text-muted-foreground">
                Optional. Coupon will expire at the end of this date.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
