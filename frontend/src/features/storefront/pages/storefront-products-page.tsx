// Products catalog page with real-time search, category filtering, and product grid.
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePublicProducts } from '../hooks/use-public-products';
import { CategoryFilter } from '../components/category-filter';
import { ProductSearchInput } from '../components/product-search-input';
import { ProductGrid } from '../components/product-grid';

export function StorefrontProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { data: products, isLoading } = usePublicProducts(
    slug!,
    searchParams.get('search') ?? undefined,
    searchParams.get('category_id') ?? undefined
  );

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      // Show near top of the page
      if (currentScrollY <= 60) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 10) {
        // Hide when scrolling DOWN
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 10) {
        // Reveal immediately when scrolling UP
        setIsVisible(true);
      }
      lastScrollY = Math.max(0, currentScrollY);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-2 sm:px-6 sm:pt-4">
      {/* Smart Sticky Header Bar - Hides on scroll down, reveals on scroll up */}
      <div
        className={`sticky top-16 z-30 transition-all duration-300 ease-out -mx-4 px-4 sm:-mx-6 sm:px-6 py-3.5 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">All Products</h1>
            <p className="text-xs text-slate-500 mt-1">{products?.length ?? 0} items available</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <ProductSearchInput />
            <CategoryFilter slug={slug!} />
          </div>
        </div>
      </div>

      <ProductGrid products={products} isLoading={isLoading} slug={slug!} />
    </div>
  );
}
