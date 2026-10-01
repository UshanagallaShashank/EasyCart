import { useState, useId, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Store, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerPageShell } from '@/features/orders/components/customer-page-shell';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import { useMyStoreRequest, useSubmitStoreRequest } from '../hooks/use-customer-store-request';

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CustomerStoreRequestPage() {
  const { user } = useCustomerAuth();
  const { data: request, isLoading } = useMyStoreRequest();
  const submitRequest = useSubmitStoreRequest();

  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  const nameId = useId();
  const slugId = useId();
  const descId = useId();

  function handleNameChange(val: string) {
    setStoreName(val);
    if (!slugEdited) {
      setSlug(toSlug(val));
    }
  }

  function handleSlugChange(val: string) {
    setSlugEdited(true);
    setSlug(toSlug(val));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!storeName.trim() || !slug.trim()) {
      toast.error('Store name and URL slug are required');
      return;
    }

    submitRequest.mutate(
      {
        store_name: storeName.trim(),
        slug: slug.trim(),
        description: description.trim()
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'Store request submitted to admin!');
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to submit store request');
        }
      }
    );
  }

  const backLink = (
    <Link
      to="/customer/orders"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
    >
      <ArrowLeft className="size-4" /> My orders
    </Link>
  );

  return (
    <CustomerPageShell
      title="Open a store on EasyCart"
      description="Request platform admin approval to launch your own business"
      actions={backLink}
    >
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : request && request.status === 'pending' ? (
          /* Pending Review State */
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-6 md:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                <Clock className="size-6" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                  Under Admin Review
                </span>
                <h2 className="text-xl font-bold text-slate-900">Store Request Pending</h2>
                <p className="text-sm text-slate-600">
                  Your application to create <strong className="text-slate-900">{request.name}</strong> is currently waiting for admin approval.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-amber-200/60 bg-white/90 p-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Requested store</span>
                <span className="font-semibold text-slate-900">{request.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Storefront URL</span>
                <span className="font-mono text-xs font-semibold text-sky-700">/{request.slug}</span>
              </div>
              {request.description && (
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Description / Note</span>
                  <p className="text-xs text-slate-700">{request.description}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted on</span>
                <span className="text-xs text-slate-700">{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-amber-800">
              Once approved by the platform admin, you will receive full owner privileges to set up products, delivery options, and customize your store.
            </p>
          </div>
        ) : request && request.status === 'active' ? (
          /* Approved State */
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 md:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                  Approved & Active
                </span>
                <h2 className="text-xl font-bold text-slate-900">Your Store is Live!</h2>
                <p className="text-sm text-slate-600">
                  The admin has approved your store request for <strong className="text-slate-900">{request.name}</strong>.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
              >
                Go to Store Dashboard <ArrowRight className="size-4" />
              </a>
              <a
                href={`/${request.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                View Storefront <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        ) : (
          /* Request Form */
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
            {request && request.status === 'rejected' && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-900">
                <XCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Previous Request Not Approved</strong>
                  <span>Your prior application was rejected by the admin. You may update your store information and submit a new request below.</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Store Application</h2>
                <p className="text-xs text-slate-500">Provide details for the store you wish to create</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={nameId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Store name <span className="text-rose-500">*</span>
                </label>
                <input
                  id={nameId}
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Organic Greens Market"
                  className="h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 transition-colors focus:border-sky-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={slugId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Store URL slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-sky-500 transition-colors bg-white">
                  <span className="text-xs text-slate-400 select-none">easycart.com/</span>
                  <input
                    id={slugId}
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="organic-greens"
                    className="h-10 w-full text-sm font-medium text-slate-900 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">This will be your public storefront link.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={descId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Description / Business Category (Optional)
                </label>
                <textarea
                  id={descId}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell the admin what products you plan to sell, your business category, or experience…"
                  className="rounded-xl border border-slate-200 p-3 text-sm text-slate-900 transition-colors focus:border-sky-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Applicant contact info */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Applicant Details</p>
                <p>Username: <strong className="font-medium text-slate-900">{user?.username}</strong></p>
                <p>Email: <strong className="font-medium text-slate-900">{user?.email}</strong></p>
                {user?.phone_number && <p>Phone: <strong className="font-medium text-slate-900">{user.phone_number}</strong></p>}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitRequest.isPending || !storeName.trim() || !slug.trim()}
                className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
              >
                <Store className="size-4 mr-2" />
                {submitRequest.isPending ? 'Submitting request…' : 'Submit store request to admin'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
