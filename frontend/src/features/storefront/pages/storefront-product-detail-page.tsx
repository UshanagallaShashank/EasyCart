import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePublicProduct } from '../hooks/use-public-product';
import { usePublicStore } from '../hooks/use-public-store';
import { StorefrontHeader } from '../components/storefront-header';
import { useCart } from '@/features/cart/cart-context';

export function StorefrontProductDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const { data: store, isLoading: storeLoading, isError: storeError } = usePublicStore(slug!);
  const { data: product, isLoading, isError } = usePublicProduct(slug!, id!);
  const { addItem } = useCart();
  const [variantLabel, setVariantLabel] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  if (storeLoading || isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (storeError || !store) return <p className="p-6 text-muted-foreground">Store not found.</p>;
  if (isError || !product) return <p className="p-6 text-muted-foreground">Product not found.</p>;

  const variant = product.variants.find((v) => v.label === variantLabel);
  const price = variant?.price ?? product.price;

  function handleAddToCart() {
    addItem({ product_id: product!.id, name: product!.name, price, quantity, variant_label: variantLabel, image: product!.images[0] });
    toast.success(`Added ${product!.name} to cart`);
  }

  return (
    <div className="flex flex-col gap-6">
      <StorefrontHeader store={store} slug={slug!} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="aspect-square w-full rounded-xl object-cover" />
        ) : (
          <div className="bg-secondary flex aspect-square w-full items-center justify-center rounded-xl">
            <Package className="text-muted-foreground size-16" />
          </div>
        )}
        <h1 className="font-heading text-2xl">{product.name}</h1>
        <p className="text-muted-foreground">{product.description}</p>
        <p className="text-xl font-medium tabular-nums">Rs. {price.toFixed(2)}</p>
        <Separator />
        {product.variants.length > 0 && (
          <Select value={variantLabel} onValueChange={setVariantLabel}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Choose a variant" /></SelectTrigger>
            <SelectContent>
              {product.variants.map((v) => <SelectItem key={v.label} value={v.label}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-24" />
        <Button onClick={handleAddToCart}>Add to cart</Button>
      </div>
    </div>
  );
}
