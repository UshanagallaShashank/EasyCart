// Order summary card with item count, subtotal, and checkout button.
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format_price } from '@/lib/format-price';
import { useCart } from '../cart-context';

export function CartSummary({ slug }: { slug: string }) {
  const { total, lines } = useCart();
  const navigate = useNavigate();
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 md:sticky md:top-24">
      <h2 className="font-heading text-lg font-bold text-slate-900">Order summary</h2>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-slate-600"><dt>Items ({itemCount})</dt><dd className="tabular-nums">{format_price(total)}</dd></div>
        <div className="flex justify-between text-slate-600"><dt>Delivery</dt><dd>Calculated at checkout</dd></div>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900"><dt>Subtotal</dt><dd className="tabular-nums">{format_price(total)}</dd></div>
      </dl>
      <Button size="lg" disabled={lines.length === 0} onClick={() => navigate(`/${slug}/checkout`)} className="h-12 rounded-full bg-slate-900 text-base font-semibold text-white hover:bg-slate-800">
        Checkout <ArrowRight className="size-4" />
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500"><Lock className="size-3.5" /> Secure checkout</p>
      <Link to={`/${slug}/products`} className="text-center text-sm font-medium text-sky-700 hover:underline">Continue shopping</Link>
    </div>
  );
}
