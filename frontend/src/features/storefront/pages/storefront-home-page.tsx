// Landing page for public storefront featuring hero banner, trust perks, and product showcase.
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { usePublicStore } from '../hooks/use-public-store';
import { usePublicProducts } from '../hooks/use-public-products';
import { StorefrontHero } from '../components/storefront-hero';
import { StorefrontFeaturesStrip } from '../components/storefront-features-strip';
import { ProductGrid } from '../components/product-grid';

export function StorefrontHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store } = usePublicStore(slug!);
  const { data: products, isLoading } = usePublicProducts(slug!);

  if (!store) return null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {store.promotion_banner_text && (
        <div className="bg-[#F58220] text-white px-6 py-2 text-center text-xs font-semibold tracking-wide">
          {store.promotion_banner_text}
        </div>
      )}
      <StorefrontHero store={store} />
      <StorefrontFeaturesStrip />
      <section className="px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
              <Sparkles className="size-3.5 text-[#F58220]" /> Featured Catalog
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">Trending Products</h2>
          </div>
          <Link to={`/${slug}/products`} className="group flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700">
            View all products <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <ProductGrid products={products?.slice(0, 8)} isLoading={isLoading} slug={slug!} />
      </section>
    </div>
  );
}
