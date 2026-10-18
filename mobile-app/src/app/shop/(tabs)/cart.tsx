// The cart now routes directly to checkout where product details are shown at the top.
import { Redirect } from 'expo-router';

export default function CartScreen() {
  return <Redirect href="/shop/checkout" />;
}
