// Storefront product display card with hover lift and image zoom
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/features/products/types/product-types';

export function ProductCard({ product, slug }: { product: Product; slug: string }) {
  return (
    <Link to={`/${slug}/products/${product.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-sky-200">
        <div className="overflow-hidden aspect-square w-full rounded-t-xl">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="bg-secondary flex w-full h-full items-center justify-center">
              <Package className="text-muted-foreground size-10 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
        </div>
        <CardHeader><CardTitle className="text-base group-hover:text-sky-600 transition-colors">{product.name}</CardTitle></CardHeader>
        <CardContent><p className="font-semibold text-slate-900 tabular-nums">${product.price.toFixed(2)}</p></CardContent>
      </Card>
    </Link>
  );
}
