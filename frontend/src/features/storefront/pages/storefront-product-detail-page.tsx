// Product details page with image preview, descriptions, and purchase form.
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicProduct } from '../hooks/use-public-product';
import { ProductDetailGallery } from '../components/product-detail-gallery';
import { ProductDetailActions } from '../components/product-detail-actions';

export function StorefrontProductDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const { data: product, isLoading, isError } = usePublicProduct(slug!, id!);

  if (isLoading) return <div className="mx-auto max-w-4xl p-6"><Skeleton className="h-96 w-full rounded-2xl" /></div>;
  if (isError || !product) return <p className="p-8 text-center text-slate-500">Product not found.</p>;

  return (
    <div className="mx-auto max-w-5xl px-6 pt-6">
      <Link to={`/${slug}/products`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 mb-6 transition-colors">
        <ArrowLeft className="size-4" /> Back to Products
      </Link>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProductDetailGallery image={product.images[0]} name={product.name} />
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Product Details</span>
          <h1 className="mt-1 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">${product.price.toFixed(2)}</p>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">{product.description}</p>
          <div className="mt-6 border-t border-slate-200/80 pt-6">
            <ProductDetailActions product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
