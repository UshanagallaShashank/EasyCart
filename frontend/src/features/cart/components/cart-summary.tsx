import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../cart-context';

export function CartSummary({ slug }: { slug: string }) {
  const { total, lines } = useCart();
  const navigate = useNavigate();
  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4">
      <h3 className="font-heading text-lg font-extrabold text-[#0F172A]">Order summary</h3>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Items ({totalItems})</span>
          <span className="font-bold text-slate-800 tabular-nums">Rs. {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Delivery</span>
          <span className="text-slate-400 font-normal">Calculated at checkout</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-extrabold text-[#0F172A]">
        <span>Subtotal</span>
        <span className="text-base font-extrabold tabular-nums">Rs. {total.toFixed(2)}</span>
      </div>

      <Button
        disabled={lines.length === 0}
        onClick={() => navigate(`/${slug}/checkout`)}
        className="w-full h-12 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs gap-2 shadow-md shadow-slate-900/10 cursor-pointer disabled:opacity-50"
      >
        Checkout <ArrowRight className="size-4" />
      </Button>

      <div className="flex flex-col items-center gap-2 pt-1 text-center">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Lock className="size-3 text-slate-400" /> Secure checkout
        </span>
        <Link to={`/${slug}/products`} className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
