import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '../cart-context';
import { CartLineRow } from '../components/cart-line-row';
import { CartSummary } from '../components/cart-summary';
import { usePublicStore } from '@/features/storefront/hooks/use-public-store';
import { StorefrontHeader } from '@/features/storefront/components/storefront-header';

export function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading, isError } = usePublicStore(slug!);
  const { lines } = useCart();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !store) return <p className="p-6 text-muted-foreground">Store not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <StorefrontHeader store={store} slug={slug!} />
      <div className="flex flex-col gap-6 p-6">
        <h1 className="font-heading text-2xl">Your cart</h1>
        {lines.length === 0 ? (
          <p className="text-muted-foreground">Your cart is empty.</p>
        ) : (
          <div className="flex max-w-2xl flex-col gap-4">
            {lines.map((line) => <CartLineRow key={`${line.product_id}-${line.variant_label ?? ''}`} line={line} />)}
            <CartSummary slug={slug!} />
          </div>
        )}
      </div>
    </div>
  );
}
