import { useState, useId, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Store, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, ExternalLink, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerPageShell } from '@/features/orders/components/customer-page-shell';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import { useMyStoreRequest, useSubmitStoreRequest } from '../hooks/use-customer-store-request';
import { DocumentUploadBox } from '../components/document-upload-box';
import { BusinessAddressFields } from '../components/business-address-fields';
import { EMPTY_ADDRESS, isAddressComplete } from '../lib/business-address';

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

import { useQuery } from '@tanstack/react-query';
import { fetchPublicStoreCategories } from '@/features/admin/api/admin-api';

export const STORE_TYPES = [
  'Others',
  'Grocery & Supermarket',
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Health & Beauty',
  'Home & Living / Furniture',
  'Jewelry & Accessories',
  'Books & Stationery',
  'Artisanal & Handicrafts',
  'Restaurant & Food',
  'Bakery',
  'General Retail'
];

export function CustomerStoreRequestPage() {
  const { user } = useCustomerAuth();
  const { slug: storeSlug } = useParams<{ slug: string }>();
  // Opened without a store in the address: use the last store the customer visited, so the storefront menus show.
  const lastStoreSlug = sessionStorage.getItem('last_store_slug');
  const { data: request, isLoading } = useMyStoreRequest();
  const submitRequest = useSubmitStoreRequest();

  const { data: categoriesData } = useQuery({
    queryKey: ['public_store_categories'],
    queryFn: fetchPublicStoreCategories
  });

  const rawCategories = categoriesData?.categories && categoriesData.categories.length > 0
    ? categoriesData.categories
    : STORE_TYPES;

  const othersItem = rawCategories.find(c => c.toLowerCase().trim() === 'others' || c.toLowerCase().trim() === 'other') || 'Others';
  const restCategories = rawCategories.filter(c => c !== othersItem && !c.toLowerCase().trim().includes('other'));

  const availableStoreTypes = [othersItem, ...restCategories];

  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('');
  const [customStoreType, setCustomStoreType] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [businessAddress, setBusinessAddress] = useState(EMPTY_ADDRESS);
  const [idProof, setIdProof] = useState<string | null>(null);
  const [businessProof, setBusinessProof] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const nameId = useId();
  const typeId = useId();
  const customTypeId = useId();
  const descriptionId = useId();
  const slugId = useId();

  const isOtherType = storeType.toLowerCase().includes('other');

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
    const finalStoreType = isOtherType ? customStoreType.trim() : storeType;

    if (!storeName.trim() || !finalStoreType || (isOtherType && !customStoreType.trim()) || !storeDescription.trim() || !slug.trim() || !isAddressComplete(businessAddress) || !idProof || !businessProof) {
      toast.error('Please fill in every field, including specifying your custom store category and PIN code, and upload both documents');
      return;
    }

    submitRequest.mutate(
      {
        store_name: storeName.trim(),
        slug: slug.trim(),
        store_type: finalStoreType,
        store_description: storeDescription.trim(),
        business_address: {
          line1: businessAddress.line1.trim(),
          landmark: businessAddress.landmark.trim(),
          city: businessAddress.city.trim(),
          state: businessAddress.state,
          pincode: businessAddress.pincode
        },
        id_proof: idProof,
        business_proof: businessProof
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

  if (!storeSlug && lastStoreSlug) return <Navigate to={`/${lastStoreSlug}/store-request`} replace />;

  const ordersPath = storeSlug ? `/${storeSlug}/orders` : '/customer/orders';

  const backLink = (
    <Link
      to={ordersPath}
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
              {request.store_type && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Store category</span>
                  <span className="font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full text-xs border border-sky-200/60">{request.store_type}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Storefront URL</span>
                <span className="font-mono text-xs font-semibold text-sky-700">/{request.slug}</span>
              </div>
              {request.store_description && (
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Store description</span>
                  <p className="text-xs text-slate-700">{request.store_description}</p>
                </div>
              )}
              {request.business_address && (
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Business address</span>
                  <p className="text-xs text-slate-700">{request.business_address}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted on</span>
                <span className="text-xs text-slate-700">{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
              {request.documents && request.documents.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-2.5">
                  <span className="text-xs font-semibold text-slate-500">Submitted verification documents</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {request.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border border-amber-200/70 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-amber-400 hover:text-amber-900 transition-colors shadow-2xs"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <FileText className="size-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </span>
                        <ExternalLink className="size-3 text-slate-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
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

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <label htmlFor={typeId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Store type / category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id={typeId}
                    required
                    value={storeType}
                    onChange={(e) => setStoreType(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 transition-colors focus:border-sky-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled>Select a store category...</option>
                    {availableStoreTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isOtherType && (
                <div className="flex flex-col gap-1.5 rounded-xl border border-sky-200 bg-sky-50/50 p-3.5">
                  <label htmlFor={customTypeId} className="text-xs font-semibold uppercase tracking-wider text-sky-900">
                    Specify your store type / category <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={customTypeId}
                    type="text"
                    required
                    value={customStoreType}
                    onChange={(e) => setCustomStoreType(e.target.value)}
                    placeholder="e.g. Pet Supplies, Hardware Store, Musical Instruments..."
                    className="h-10 rounded-xl border border-sky-300 bg-white px-3.5 text-sm text-slate-900 transition-colors focus:border-sky-500 focus:outline-none placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-sky-700">Please provide your custom store category name.</p>
                </div>
              )}

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
                <label htmlFor={descriptionId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Store description / purpose <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id={descriptionId}
                  required
                  rows={3}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Describe what your store is for (e.g. Selling fresh organic groceries, artisanal goods, clothing & accessories...)"
                  className="rounded-xl border border-slate-200 p-3 text-sm text-slate-900 transition-colors focus:border-sky-500 focus:outline-none placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-500">Briefly explain what products or services your store will offer to customers.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DocumentUploadBox label="ID proof (PDF or Image)" hint="PDF, Aadhaar, PAN, passport…" onChange={setIdProof} />
                <DocumentUploadBox label="Business proof (PDF or Image)" hint="PDF, GST, licence, registration…" onChange={setBusinessProof} />
              </div>

              <BusinessAddressFields value={businessAddress} onChange={setBusinessAddress} />

              {/* Applicant contact info */}
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600 sm:grid-cols-2">
                <p className="font-semibold text-slate-700 sm:col-span-2">Applicant details</p>
                <p className="truncate">Username: <strong className="font-medium text-slate-900">{user?.username}</strong></p>
                {user?.phone_number && <p>Phone: <strong className="font-medium text-slate-900">{user.phone_number}</strong></p>}
                <p className="truncate sm:col-span-2">Email: <strong className="font-medium text-slate-900">{user?.email}</strong></p>
              </div>

              {/* The submit bar stays at the bottom of the screen, so it is always visible without scrolling */}
              <div className="sticky bottom-0 z-10 -mx-6 -mb-6 rounded-b-2xl border-t border-slate-100 bg-white/95 px-6 py-3 backdrop-blur md:-mx-8 md:-mb-8 md:px-8">
              <Button
                type="submit"
                size="lg"
                disabled={submitRequest.isPending || !storeName.trim() || !storeType || (isOtherType && !customStoreType.trim()) || !storeDescription.trim() || !slug.trim() || !isAddressComplete(businessAddress) || !idProof || !businessProof}
                className="w-full bg-sky-600 font-semibold text-white hover:bg-sky-700"
              >
                <Store className="size-4 mr-2" />
                {submitRequest.isPending ? 'Submitting request…' : 'Submit store request to admin'}
              </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
