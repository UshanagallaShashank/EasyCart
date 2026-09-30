// Customer storefront layout with unified header, footer, and store resolution.
import { useParams, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { CartProvider } from '@/features/cart/cart-provider';
import { usePublicStore } from '@/features/storefront/hooks/use-public-store';
import { StorefrontHeader } from '@/features/storefront/components/storefront-header';
import { StorefrontFooter } from '@/features/storefront/components/storefront-footer';
import { StorefrontNotFound } from '@/features/storefront/components/storefront-not-found';

export function StorefrontLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading, isError } = usePublicStore(slug!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !store) return <StorefrontNotFound slug={slug!} />;

  return (
    <CartProvider slug={slug!}>
      <div className="flex min-h-screen flex-col bg-slate-50/60 font-sans text-slate-900">
        <StorefrontHeader store={store} slug={slug!} />
        <main className="flex-1 animate-content-in pb-12"><Outlet /></main>
        <StorefrontFooter store={store} slug={slug!} />
      </div>
    </CartProvider>
  );
}
