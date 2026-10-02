// Where a signed-in customer lands when no shop is in the address (for example after signing in at /login).
// One store: go straight to it. Several: let them pick. None yet: explain how to open one.
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/page-loading';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import { useMyStores } from '@/features/orders/hooks/use-my-stores';

export function CustomerHomePage() {
  const { user, logout } = useCustomerAuth();
  const { data: stores, isLoading } = useMyStores();

  if (isLoading) return <PageLoading />;
  if (stores?.length === 1) return <Navigate to={`/${stores[0].slug}`} replace />;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
        <Store className="size-8" />
      </span>

      {stores?.length ? (
        <>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Welcome back, {user?.username}</h1>
          <p className="text-sm text-slate-500">Which store would you like to open?</p>
          <ul className="flex w-full max-w-sm flex-col gap-2">
            {stores.map((store) => (
              <li key={store.slug}>
                <Link
                  to={`/${store.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
                >
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="" className="size-10 rounded-xl object-cover" />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500 font-heading font-bold text-white">
                      {store.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="flex-1 truncate font-semibold text-slate-900">{store.name}</span>
                  <ChevronRight className="size-4 text-slate-300" />
                </Link>
              </li>
            ))}
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

      <Button variant="outline" onClick={logout}>Log out</Button>
    </div>
  );
}
