// "Add more from this shop": a shelf of in-stock products that are not in the cart yet, shown in the cart
// (and, when the cart is empty, as popular picks), so shoppers can top up without going back to the home.
import { useT } from '@/lib/i18n';
import { useProducts } from './shop-api';
import { useShop } from './shop-context';
import { useCardActions } from './product-card';
import { ProductRail } from './product-rail';

const MAX_SUGGESTIONS = 8;

export function CartSuggestions({ emptyCart = false }: { emptyCart?: boolean }) {
  const { slug, lines } = useShop();
  const products = useProducts(slug, '', '');
  const actions = useCardActions();
  const t = useT();
  const inCart = new Set(lines.map((line) => line.product_id));
  const picks = (products.data ?? []).filter((product) => product.is_active && product.stock_quantity > 0 && !inCart.has(product.id)).slice(0, MAX_SUGGESTIONS);
  const title = emptyCart ? t('Popular in this shop') : t('Add more from this shop');
  return <ProductRail actions={actions} title={title} subtitle={emptyCart ? undefined : t('Often bought together')} products={picks} />;
}
