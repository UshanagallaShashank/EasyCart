// Product card with image preview, stock status, and hover interactions.
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, ArrowUpRight } from 'lucide-react';
import type { Product } from '@/features/products/types/product-types';

export function ProductCard({ product, slug }: { product: Product; slug: string }) {
  const inStock = product.stock_quantity === undefined || product.stock_quantity > 0;

  return (
    <Link to={`/${slug}/products/${product.id}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-[border-color,box-shadow] duration-300 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/10"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-108" />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-300"><Package className="size-10" /></div>
          )}
          <span className={`absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${inStock ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
            {inStock ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
          <div>
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-sky-600">{product.name}</h3>
            {product.description && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.description}</p>}
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="font-heading text-sm font-bold text-slate-900 sm:text-base">Rs. {product.price.toFixed(2)}</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
