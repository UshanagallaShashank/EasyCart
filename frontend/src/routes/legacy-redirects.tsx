// Old customer addresses keep working: they forward to the same page inside a shop.
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { getLastStoreSlug } from '@/features/storefront/lib/customer-paths';

// /<shop>/orders, /<shop>/orders/123 and /<shop>/store-request  ->  /<shop>/customer/...
export function LegacyShopRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const restOfPath = location.pathname.slice(`/${slug}`.length);
  return <Navigate to={`/${slug}/customer${restOfPath}${location.search}`} replace />;
}

// /customer/orders and friends (no shop in the address)  ->  /<last shop>/customer/...
export function BareCustomerRedirect() {
  const location = useLocation();
  const lastSlug = getLastStoreSlug();
  if (!lastSlug) return <Navigate to="/login" replace />;

  const restOfPath = location.pathname.slice('/customer'.length);
  return <Navigate to={`/${lastSlug}/customer${restOfPath}${location.search}`} replace />;
}
