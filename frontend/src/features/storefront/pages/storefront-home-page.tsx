import { useParams, Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicStore } from '../hooks/use-public-store';
import { usePublicProducts } from '../hooks/use-public-products';
import { StorefrontHeader } from '../components/storefront-header';
import { StorefrontHero } from '../components/storefront-hero';
import { ProductGrid } from '../components/product-grid';

export function StorefrontHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading, isError } = usePublicStore(slug!);
  const { data: products, isLoading: productsLoading } = usePublicProducts(slug!);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !store) return <p className="p-6 text-muted-foreground">Store not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <StorefrontHeader store={store} slug={slug!} />
      {store.promotion_banner_text && (
        <div className="bg-accent text-accent-foreground px-6 py-2 text-center text-sm font-medium">{store.promotion_banner_text}</div>
      )}
      <StorefrontHero store={store} />
      <div className="px-6">
        <ProductGrid products={products?.slice(0, 8)} isLoading={productsLoading} slug={slug!} />
        <Link to={`/${slug}/products`} className="mt-4 inline-block underline">View all products</Link>
      </div>
    </div>
  );
}
