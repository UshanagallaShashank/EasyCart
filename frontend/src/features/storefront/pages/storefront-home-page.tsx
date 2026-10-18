// Landing page for public storefront featuring hero banner, trust perks, and product showcase.
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
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

  const categories = ['All Products', 'Trending', 'New Arrivals', 'Featured', 'Best Sellers'];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {store.promotion_banner_text && (
        <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500 text-white px-4 py-2 text-center text-xs font-bold tracking-wider uppercase shadow-sm">
          {store.promotion_banner_text}
        </div>
      )}
      <StorefrontHero store={store} />
      <StorefrontFeaturesStrip />

      {/* Category Pills Bar */}
      <section className="px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                idx === 0
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-102'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <Reveal className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
              <Sparkles className="size-3.5 text-[#F58220]" /> Featured Catalog
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">Trending Products</h2>
          </div>
          <Link to={`/${slug}/products`} className="group flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700">
            View all products <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <ProductGrid products={products?.slice(0, 8)} isLoading={isLoading} slug={slug!} />
      </section>
    </div>
  );
}
