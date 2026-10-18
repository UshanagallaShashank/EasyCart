// "Shop by category" row of links that open the catalog pre-filtered to a category.
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { usePublicCategories } from '../hooks/use-public-categories';

export function CategoryShortcuts({ slug }: { slug: string }) {
  const { data: categories } = usePublicCategories(slug);
  if (!categories?.length) return null;

  return (
    <section>
      <h2 className="mb-4 font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Shop by category</h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {categories.map((c) => (
          <Link key={c.id} to={`/${slug}/products?category_id=${c.id}`} className="group flex h-12 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white pr-3 pl-5 text-sm font-semibold text-slate-800 transition-colors hover:border-sky-300 hover:bg-sky-50">
            {c.name}
            <ChevronRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-600" />
          </Link>
        ))}
      </div>
    </section>
  );
}
