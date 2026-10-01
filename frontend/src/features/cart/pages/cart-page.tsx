// Shopping cart page displaying customer item lines and checkout summary.
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../cart-context';
import { CartLineRow } from '../components/cart-line-row';
import { CartSummary } from '../components/cart-summary';
import { usePublicProducts } from '@/features/storefront/hooks/use-public-products';

export function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lines } = useCart();
  // Fetch all store products so we can fill in any missing images in cart lines
  const { data: products } = usePublicProducts(slug!);

  // Enrich cart lines with images from the storefront product list when line.image is missing
  const enrichedLines = lines.map((line) => {
    if (line.image) return line;
    const product = products?.find((p) => p.id === line.product_id);
    return product?.images?.[0] ? { ...line, image: product.images[0] } : line;
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-4 sm:px-6 sm:pt-6">
      <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] tracking-tight sm:text-4xl">Your cart</h1>
      {lines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center bg-white shadow-2xs"
        >
          <ShoppingBag className="size-12 text-sky-300 mb-3 animate-float-slow" />
          <p className="text-base font-semibold text-slate-800">Your cart is empty</p>
          <p className="text-xs text-slate-500 mb-4">Discover our catalog and add items to your cart.</p>
          <Button asChild className="bg-sky-600 hover:bg-sky-500 text-white">
            <Link to={`/${slug}/products`}>Browse Products <ArrowRight className="ml-1.5 size-4" /></Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3 md:col-span-2">
            <AnimatePresence initial={false}>
              {enrichedLines.map((line) => (
                <motion.div
                  key={`${line.product_id}-${line.variant_label ?? ''}`}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <CartLineRow line={line} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="md:col-span-1">
            <CartSummary slug={slug!} />
          </div>
        </div>
      )}
    </div>
  );
}
