// Where a signed-in customer lands when no shop is in the address (for example after signing in at /login).
// One store: go straight to it. Several: let them pick. None yet: explain how to open one.
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/page-loading';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import { useMyStores } from '@/features/orders/hooks/use-my-stores';
import { CustomerLocationBadge } from '@/features/storefront/components/customer-location-badge';
import { checkStoreDeliveryEligibility } from '@/features/storefront/lib/delivery-radius';

export function CustomerHomePage() {
  const { user, logout } = useCustomerAuth();
  const { data: stores, isLoading } = useMyStores();

  if (isLoading) return <PageLoading />;
  if (stores?.length === 1) return <Navigate to={`/${stores[0].slug}`} replace />;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-6 py-10 text-center relative">
      <div className="absolute top-4 right-6">
        <CustomerLocationBadge />
      </div>

      <span className="flex size-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
        <Store className="size-8" />
      </span>

      {stores?.length ? (
        <>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Welcome back, {user?.username}</h1>
          <p className="text-sm text-slate-500">Select a store servicing your location to start shopping</p>

          <ul className="flex w-full max-w-md flex-col gap-3 mt-2">
            {stores.map((store) => {
              const delivery = checkStoreDeliveryEligibility(store);
              return (
                <li key={store.slug}>
                  <Link
                    to={`/${store.slug}`}
                    className={`flex items-center gap-3.5 rounded-2xl border p-3.5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      delivery.isEligible ? 'border-slate-200/80 bg-white hover:border-sky-300' : 'border-amber-200/80 bg-amber-50/40 opacity-85'
                    }`}
                  >
                    {store.logo_url ? (
                      <img src={store.logo_url} alt="" className="size-11 rounded-xl object-cover shrink-0" />
                    ) : (
                      <span className="flex size-11 items-center justify-center rounded-xl bg-sky-500 font-heading font-bold text-white shrink-0">
                        {store.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-slate-900 text-sm">{store.name}</span>
                        {delivery.isEligible ? (
                          <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                            Delivering
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shrink-0">
                            Out of Radius
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{delivery.message}</p>
                    </div>
                    <ChevronRight className="size-4 text-slate-300 shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Open a store to start shopping</h1>
          <p className="max-w-sm text-sm text-slate-500">
            Hi {user?.username}! Your orders and account live inside each store. Use the store's link (it looks like
            easycart.com/<strong>store-name</strong>) to continue.
          </p>
        </>
      )}

      <Button variant="outline" onClick={logout} className="mt-2 rounded-xl">Log out</Button>
    </div>
  );
}
