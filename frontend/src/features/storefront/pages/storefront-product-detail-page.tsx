// Product details page with image gallery, pricing, stock state, and purchase actions.
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Truck, ShieldCheck } from 'lucide-react';
import { usePublicProduct } from '../hooks/use-public-product';
import { ProductDetailGallery } from '../components/product-detail-gallery';
import { ProductDetailActions } from '../components/product-detail-actions';
import { ProductDetailSkeleton } from '../components/product-detail-skeleton';
import { StockBadge } from '../components/stock-badge';
import { get_stock_status } from '../utils/get-stock-status';

export function StorefrontProductDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const { data: product, isLoading, isError } = usePublicProduct(slug!, id!);

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <p className="px-4 py-24 text-center text-slate-500">This product isn't available. <Link to={`/${slug}/products`} className="font-semibold text-sky-700 hover:underline">Browse the shop</Link></p>;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-8">
      <Link to={`/${slug}/products`} className="mb-4 inline-flex min-h-10 items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
        <ChevronLeft className="size-4" /> Back to shop
      </Link>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-14">
        <ProductDetailGallery key={product.id} images={product.images} name={product.name} />
        <div className="flex flex-col md:py-4">
          <StockBadge status={get_stock_status(product)} quantity={product.stock_quantity} className="w-fit" />
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">{product.name}</h1>
          <div className="mt-4"><ProductDetailActions key={product.id} product={product} slug={slug!} /></div>
          {product.description && <p className="mt-8 border-t border-slate-200 pt-6 text-[15px] leading-relaxed whitespace-pre-line text-slate-600">{product.description}</p>}
          <ul className="mt-6 grid gap-3 rounded-2xl bg-slate-100/70 p-4 text-sm text-slate-600">
            <li className="flex items-center gap-2.5"><Truck className="size-4 text-sky-600" /> Delivery or in-store pickup at checkout</li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="size-4 text-emerald-600" /> Secure checkout</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
