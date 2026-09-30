import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useCart } from '../cart-context';

export function CartSummary({ slug }: { slug: string }) {
  const { total, lines } = useCart();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      <Separator />
      <p className="text-lg font-medium tabular-nums">Total: ${total.toFixed(2)}</p>
      <Button disabled={lines.length === 0} onClick={() => navigate(`/${slug}/checkout`)}>
        Checkout
      </Button>
    </div>
  );
}
