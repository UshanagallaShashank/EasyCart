import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, ArrowUpRight } from 'lucide-react';
import type { Product } from '@/features/products/types/product-types';
import { get_stock_status } from '../utils/get-stock-status';

export function ProductCard({ product, slug }: { product: Product; slug: string }) {
  const stockStatus = get_stock_status(product);
  const badgeConfig = {
    out: { label: 'Out of Stock', style: 'bg-rose-500/90 text-white' },
    low: { label: 'Low Stock', style: 'bg-amber-500/90 text-white' },
    in: { label: 'In Stock', style: 'bg-emerald-500/90 text-white' },
  }[stockStatus];

  return (
    <Link to={`/${slug}/products/${product.id}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-108" />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-300"><Package className="size-10" /></div>
          )}
          <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs backdrop-blur-md ${badgeConfig.style}`}>
            {badgeConfig.label}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Featured</span>
            <h3 className="mt-0.5 line-clamp-2 text-sm font-bold text-slate-800 transition-colors group-hover:text-sky-600">{product.name}</h3>
            {product.description && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.description}</p>}
          </div>
          <div className="mt-4 flex items-center justify-between pt-2.5 border-t border-slate-100">
            <span className="font-heading text-base font-extrabold text-slate-900">Rs. {product.price.toFixed(2)}</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-all duration-300 group-hover:bg-[#F58220] group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
