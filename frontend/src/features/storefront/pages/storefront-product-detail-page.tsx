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

  if (isLoading) return <div className="mx-auto max-w-4xl p-6"><Skeleton className="h-96 w-full rounded-3xl" /></div>;
  if (isError || !product) return <p className="p-8 text-center text-slate-500 font-medium">Product not found.</p>;

  const inStock = product.stock_quantity === undefined || product.stock_quantity > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6">
      <Link to={`/${slug}/products`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 mb-6 transition-colors">
        <ArrowLeft className="size-4" /> Back to shop
      </Link>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 items-start">
        {/* Product Image Gallery Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden flex items-center justify-center">
          <ProductDetailGallery image={product.images[0]} name={product.name} />
        </div>

        {/* Product Details & Purchase Controls */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              inStock ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}>
              <span className="size-1.5 rounded-full bg-amber-500" />
              {product.stock_quantity ? `Only ${product.stock_quantity} left` : inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-2xl font-bold text-[#0F172A] tabular-nums">Rs. {product.price.toFixed(2)}</p>

          {product.description && (
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <ProductDetailActions product={product} slug={slug!} />
          </div>
        </div>
      </div>
    </div>
  );
}
