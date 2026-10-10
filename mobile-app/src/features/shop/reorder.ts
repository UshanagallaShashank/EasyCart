// "Order again": puts the items of a past order back in the cart, using today's price and stock.
import { router } from 'expo-router';
import { fileUrl } from '@/lib/api';
import { useToast } from '@/components/toast';
import type { Order } from '@/types/order';
import { useShop } from './shop-context';
import { useProducts } from './shop-api';
import { productStock } from './product-card';
import { useT } from '@/lib/i18n';

export function useReorder() {
  const { slug, add } = useShop();
  const products = useProducts(slug, '', '');
  const toast = useToast();
  const t = useT();

  return function reorder(order: Order) {
    const catalog = products.data ?? [];
    let added = 0;
    let skipped = 0;

    for (const item of order.items) {
      const product = catalog.find((p) => p.id === item.product_id);
      if (!product) {
        skipped += 1;
        continue;
      }

      const variant = product.variants.find((v) => v.label === item.variant_label);
      const stock = variant ? variant.stock : productStock(product);
      if (stock <= 0) {
        skipped += 1;
        continue;
      }

      add({
        product_id: product.id,
        variant_label: variant?.label,
        name: product.name,
        price: variant ? variant.price : product.price,
        quantity: Math.min(item.quantity, stock),
        image: fileUrl(product.images[0]),
        max: stock
      });
      added += 1;
    }

    if (added === 0) {
      toast('Those items are not available in this shop right now', 'error');
      return;
    }
    toast(skipped > 0 ? t('{added} added, {skipped} not available', { added, skipped }) : t('Items added to your cart'), 'success');
    router.push('/shop/cart');
  };
}
