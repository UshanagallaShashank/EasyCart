import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/features/products/types/product-types';

export function ProductCard({ product, slug }: { product: Product; slug: string }) {
  return (
    <Link to={`/${slug}/products/${product.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="aspect-square w-full rounded-t-xl object-cover" />
        ) : (
          <div className="bg-secondary flex aspect-square w-full items-center justify-center rounded-t-xl">
            <Package className="text-muted-foreground size-10" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-base">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium tabular-nums">${product.price.toFixed(2)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
