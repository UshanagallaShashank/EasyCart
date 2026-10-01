import { useParams, Outlet } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { PageLoading } from '@/components/page-loading';
import { Skeleton } from '@/components/ui/skeleton';
import { CartProvider } from '@/features/cart/cart-provider';
import { usePublicStore } from '@/features/storefront/hooks/use-public-store';
import { StorefrontHeader } from '@/features/storefront/components/storefront-header';
import { StorefrontSidebar } from '@/features/storefront/components/storefront-sidebar';
import { StorefrontFooter } from '@/features/storefront/components/storefront-footer';
import { StorefrontNotFound } from '@/features/storefront/components/storefront-not-found';

export function StorefrontLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading, isError } = usePublicStore(slug!);

  // Remember which store the customer last visited so My Orders can link back home
  useEffect(() => {
    if (slug) sessionStorage.setItem('last_store_slug', slug);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-svh bg-slate-50/50 p-6 space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !store) return <StorefrontNotFound slug={slug!} />;

  return (
    <CartProvider slug={slug!}>
      <div className="flex min-h-svh flex-col bg-slate-50/60 font-sans text-slate-900">
        <StorefrontHeader store={store} slug={slug!} />
        <div className="flex flex-1">
          <StorefrontSidebar store={store} slug={slug!} />
          <div className="flex flex-1 flex-col min-w-0">
            <main className="flex-1 animate-content-in pb-12">
              <Suspense fallback={<PageLoading />}>
                <Outlet />
              </Suspense>
            </main>
            <StorefrontFooter store={store} slug={slug!} />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}


