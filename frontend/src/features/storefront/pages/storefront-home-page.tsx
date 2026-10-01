// Landing page for a public storefront: hero, trust perks, categories, and featured products.
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { usePublicStore } from '../hooks/use-public-store';
import { usePublicProducts } from '../hooks/use-public-products';
import { StorefrontHero } from '../components/storefront-hero';
import { StorefrontFeaturesStrip } from '../components/storefront-features-strip';
import { CategoryShortcuts } from '../components/category-shortcuts';
import { ProductGrid } from '../components/product-grid';

export function StorefrontHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: store } = usePublicStore(slug!);
  const { data: products, isLoading } = usePublicProducts(slug!);

  if (!store) return null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-4 sm:gap-14 sm:px-6 sm:pt-6">
      <StorefrontHero store={store} />
      <StorefrontFeaturesStrip />
      <CategoryShortcuts slug={slug!} />
      <section>
        <Reveal className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Featured products</h2>
          <Link to={`/${slug}/products`} className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
            View all <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <ProductGrid products={products?.slice(0, 8)} isLoading={isLoading} slug={slug!} />
      </section>
    </div>
  );
}
