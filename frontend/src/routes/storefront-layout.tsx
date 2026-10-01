// Customer storefront layout with unified header, footer, and store resolution.
import { useParams, Outlet } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { PageLoading } from '@/components/page-loading';
import { Skeleton } from '@/components/ui/skeleton';
import { CartProvider } from '@/features/cart/cart-provider';
import { usePublicStore } from '@/features/storefront/hooks/use-public-store';
import { StorefrontHeader } from '@/features/storefront/components/storefront-header';
import { StorefrontFooter } from '@/features/storefront/components/storefront-footer';
import { StorefrontNotFound } from '@/features/storefront/components/storefront-not-found';
import { PromotionBar } from '@/features/storefront/components/promotion-bar';

export function StorefrontLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading, isError } = usePublicStore(slug!);

  // Remember which store the customer last visited so My Orders can link back home
  useEffect(() => {
    if (slug) sessionStorage.setItem('last_store_slug', slug);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-svh space-y-6 bg-slate-50 p-4 sm:p-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-[340px] w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !store) return <StorefrontNotFound slug={slug!} />;

  return (
    <CartProvider slug={slug!}>
      <div className="flex min-h-svh flex-col bg-slate-50 font-sans text-slate-900">
        <PromotionBar text={store.promotion_banner_text} />
        <StorefrontHeader store={store} slug={slug!} />
        <main className="flex-1 animate-content-in pb-16"><Suspense fallback={<PageLoading />}><Outlet /></Suspense></main>
        <StorefrontFooter store={store} slug={slug!} />
      </div>
    </CartProvider>
  );
}
