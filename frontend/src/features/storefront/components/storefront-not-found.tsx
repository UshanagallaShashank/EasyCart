// Polished fallback screen displayed when a storefront is not found or unpublished.
import { Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StorefrontNotFound({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm border border-sky-100 mb-6">
        <Store className="size-10" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
        Store Not Available
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The store &ldquo;{slug}&rdquo; is currently offline, undergoing maintenance, or has not been published yet.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="outline" className="border-slate-200">
          <Link to="/"><ArrowLeft className="mr-2 size-4" /> Back to Home</Link>
        </Button>
        <Button asChild className="bg-sky-600 hover:bg-sky-500 text-white">
          <Link to="/register">Create Your Store</Link>
        </Button>
      </div>
    </div>
  );
}
