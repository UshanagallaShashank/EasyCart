// At the store: the rider types the 4-digit code the store shows on its order screen, proving the handover.
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/shared/api/api-error';
import { confirmPickup } from '@/features/delivery/api/rider-api';
import type { RiderOrder } from '@/features/delivery/types/delivery-types';
import { useRiderOrderMutation } from '../hooks/use-rider-queries';
import { CodeInput } from './code-input';
import { FormSection } from './form-section';

export function PickupStep({ order }: { order: RiderOrder }) {
  const [code, setCode] = useState('');
  const pickup = useRiderOrderMutation((pickupCode: string) => confirmPickup(order.id, pickupCode));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    pickup.mutate(code, {
      onSuccess: () => toast.success('Picked up. Head to the customer.'),
      onError: (err) => { setCode(''); toast.error(err instanceof ApiError ? err.message : 'Could not confirm pickup'); }
    });
  }

  return (
    <FormSection icon={PackageCheck} title="Collect the order" description="Check the items with the store, then ask them for the 4-digit pickup code on their screen.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <CodeInput id="pickup-code" label="Pickup code" length={4} value={code} onChange={setCode} />
        <p className="text-xs text-slate-500">{order.pickup_attempts_left} {order.pickup_attempts_left === 1 ? 'try' : 'tries'} left</p>
        <Button type="submit" size="lg" disabled={code.length !== 4 || pickup.isPending}>{pickup.isPending ? 'Checking…' : 'Confirm pickup'}</Button>
      </form>
    </FormSection>
  );
}
