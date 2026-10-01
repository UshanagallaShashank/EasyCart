import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/features/cart/cart-context';
import { useCheckout } from '../hooks/use-checkout';
import { validateCoupon, type ValidatedCoupon } from '../api/checkout-api';
import { ApiError } from '@/shared/api/api-error';
import { usePublicStore } from '@/features/storefront/hooks/use-public-store';

export function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading, isError } = usePublicStore(slug!);
  const { lines, total } = useCart();
  const checkoutMutation = useCheckout(slug!);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const deliveryFee = fulfillmentMethod === 'delivery' ? (store?.delivery_fee ?? 0) : 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === 'percent'
      ? Math.min(total, (total * appliedCoupon.discount_value) / 100)
      : Math.min(total, appliedCoupon.discount_value)
    : 0;
  const amountToPay = Math.max(0, total - discountAmount) + deliveryFee;

  async function handleApplyCoupon() {
    const trimmed = couponInput.trim();
    if (!trimmed) {
      toast.error('Please enter a coupon code');
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await validateCoupon(slug!, trimmed);
      setAppliedCoupon(res.coupon);
      setCouponInput('');
      setCouponError('');
      toast.success(`Coupon "${res.coupon.code}" applied`);
    } catch (err) {
      setAppliedCoupon(null);
      const msg = err instanceof ApiError ? err.message : 'Invalid coupon code';
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  }


  function handlePlaceOrder() {
    checkoutMutation.mutate(
      {
        items: lines.map((l) => ({ product_id: l.product_id, variant_label: l.variant_label, quantity: l.quantity })),
        payment_method: 'cash_on_delivery',
        fulfillment_method: fulfillmentMethod,
        delivery_address: fulfillmentMethod === 'delivery' ? deliveryAddress : undefined,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined
      },
      {
        onError: (err) => {
          const msg = err instanceof ApiError ? err.message : 'Checkout failed';
          toast.error(msg);
          if (msg.toLowerCase().includes('coupon')) {
            setAppliedCoupon(null);
          }
        }
      }
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
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">"{appliedCoupon.code}" applied</span>
                {discountAmount > 0 && (
                  <span className="text-xs font-semibold text-emerald-600">(-Rs. {discountAmount.toFixed(2)})</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                id="coupon_code"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  if (couponError) setCouponError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                placeholder="Enter coupon code"
                className="flex-1 uppercase placeholder:normal-case"
                disabled={isValidatingCoupon}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim() || isValidatingCoupon}
              >
                {isValidatingCoupon ? 'Checking…' : 'Apply'}
              </Button>
            </div>
          )}
          {couponError && (
            <p className="text-xs font-medium text-destructive text-center">
              {couponError}
            </p>
          )}
        </div>

        <Separator />
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items subtotal</span>
            <span className="tabular-nums">Rs. {total.toFixed(2)}</span>
          </div>
          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Coupon discount ({appliedCoupon.code})</span>
              <span className="tabular-nums">-Rs. {discountAmount.toFixed(2)}</span>
            </div>
          )}
          {fulfillmentMethod === 'delivery' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="tabular-nums">Rs. {deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between items-baseline font-semibold text-base">
            <span>Total amount to pay</span>
            <span className="text-lg font-bold tabular-nums text-foreground">Rs. {amountToPay.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Payment method: Cash on delivery</p>
        <Button onClick={handlePlaceOrder} disabled={checkoutMutation.isPending || !canPlaceOrder}>
          {checkoutMutation.isPending ? 'Placing order…' : 'Place order'}
        </Button>
      </div>
    </div>
  );
}

