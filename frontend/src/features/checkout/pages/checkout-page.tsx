import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/features/cart/cart-context';
import { useCheckout } from '../hooks/use-checkout';
import { ApiError } from '@/shared/api/api-error';
import { usePublicStore } from '@/features/storefront/hooks/use-public-store';

export function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading, isError } = usePublicStore(slug!);
  const { lines, total } = useCart();
  const checkoutMutation = useCheckout(slug!);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const deliveryFee = fulfillmentMethod === 'delivery' ? (store?.delivery_fee ?? 0) : 0;
  const grandTotal = total + deliveryFee;

  function handlePlaceOrder() {
    checkoutMutation.mutate(
      {
        items: lines.map((l) => ({ product_id: l.product_id, variant_label: l.variant_label, quantity: l.quantity })),
        payment_method: 'cash_on_delivery',
        fulfillment_method: fulfillmentMethod,
        delivery_address: fulfillmentMethod === 'delivery' ? deliveryAddress : undefined,
        coupon_code: couponCode.trim() || undefined
      },
      { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Checkout failed') }
    );
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !store) return <p className="p-6 text-muted-foreground">Store not found.</p>;
  if (lines.length === 0) return <p className="p-6 text-muted-foreground">Your cart is empty.</p>;

  const canPlaceOrder = fulfillmentMethod === 'pickup' || deliveryAddress.trim().length > 0;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 pt-6">
      <div className="flex max-w-md flex-col gap-4 p-6">
        <h1 className="font-heading text-2xl">Checkout</h1>
        {lines.map((line) => (
          <div key={`${line.product_id}-${line.variant_label ?? ''}`} className="flex justify-between text-sm">
            <span>{line.name} × {line.quantity}</span>
            <span className="tabular-nums">Rs. {(line.price * line.quantity).toFixed(2)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex flex-col gap-2">
          <Label>Fulfillment</Label>
          <Select value={fulfillmentMethod} onValueChange={(value) => setFulfillmentMethod(value as 'pickup' | 'delivery')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">Pickup</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {fulfillmentMethod === 'delivery' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="delivery_address">Delivery address</Label>
            <Textarea id="delivery_address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
          </div>
        )}
        {fulfillmentMethod === 'delivery' && (
          <div className="flex justify-between text-sm">
            <span>Delivery fee</span>
            <span className="tabular-nums">Rs. {deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon_code">Coupon code</Label>
          <Input id="coupon_code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Optional" />
        </div>
        <Separator />
        <p className="font-medium tabular-nums">Total: Rs. {grandTotal.toFixed(2)}</p>
        <p className="text-muted-foreground text-sm">Payment method: Cash on delivery</p>
        <Button onClick={handlePlaceOrder} disabled={checkoutMutation.isPending || !canPlaceOrder}>
          {checkoutMutation.isPending ? 'Placing order…' : 'Place order'}
        </Button>
      </div>
    </div>
  );
}
