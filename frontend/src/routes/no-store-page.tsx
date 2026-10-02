// Shown to a signed-in customer who has not opened any shop yet: customer pages always belong to a shop.
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';

export function NoStorePage() {
  const { user, logout } = useCustomerAuth();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
        <Store className="size-8" />
      </span>
      <h1 className="font-heading text-2xl font-bold text-slate-900">Open a store to start shopping</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Hi {user?.username}! Your orders and account live inside each store. Use the store's link (it looks like
        easycart.com/<strong>store-name</strong>) to continue.
      </p>
      <Button variant="outline" onClick={logout}>Log out</Button>
    </div>
  );
}
