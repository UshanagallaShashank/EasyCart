// The delivery partner application: details, base location, documents, then review and send to an admin.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileCheck2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { ApiError } from '@/shared/api/api-error';
import { submitApplication } from '@/features/delivery/api/rider-api';
import { DOCUMENT_INFO, OPTIONAL_DOCUMENT_KINDS, REQUIRED_DOCUMENT_KINDS, VEHICLE_LABELS } from '@/features/delivery/lib/delivery-labels';
import { DocumentGallery } from '@/features/delivery/components/document-gallery';
import type { Rider } from '@/features/delivery/types/delivery-types';
import { useMyRider, useRiderProfileMutation } from '../hooks/use-rider-queries';
import { RiderProfileForm } from '../components/rider-profile-form';
import { BaseLocationCard } from '../components/base-location-card';
import { DocumentTile } from '../components/document-tile';
import { OtherDocuments } from '../components/other-documents';
import { ApplicationStatusCard } from '../components/application-status-card';
import { FormSection } from '../components/form-section';
import { StepTabs } from '../components/step-tabs';

type Step = 'details' | 'location' | 'documents' | 'review';

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-slate-900">{value || '—'}</span>
    </div>
  );
}

function ReviewStep({ rider, onEdit }: { rider: Rider; onEdit(step: Step): void }) {
  const navigate = useNavigate();
  const submit = useRiderProfileMutation(submitApplication);
  const missing = rider.missing_steps;
  const editable = rider.status === 'draft' || rider.status === 'rejected';

  function handleSubmit() {
    submit.mutate(undefined, {
      onSuccess: () => { toast.success('Application sent. We will let you know once it is reviewed.'); navigate('/rider'); },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not send the application')
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <FormSection icon={FileCheck2} title="Check everything" description="An admin compares these details with your documents.">
        <div className="grid gap-x-8 md:grid-cols-2">
          <div>
            <ReviewRow label="Name" value={rider.full_name} />
            <ReviewRow label="Date of birth" value={rider.date_of_birth} />
            <ReviewRow label="Mobile" value={rider.phone_number} />
            <ReviewRow label="Email" value={rider.email} />
            <ReviewRow label="Area" value={[rider.area, rider.city, rider.pincode].filter(Boolean).join(', ')} />
          </div>
          <div>
            <ReviewRow label="Vehicle" value={rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : ''} />
            <ReviewRow label="Number plate" value={rider.vehicle_number} />
            <ReviewRow label="Licence" value={rider.license_number} />
            <ReviewRow label="Licence valid until" value={rider.license_expiry} />
            <ReviewRow label="Base location" value={rider.latitude !== null ? 'Pinned' : 'Not pinned'} />
          </div>
        </div>
        <div className="mt-4"><DocumentGallery documents={rider.documents} /></div>
      </FormSection>

      {missing.length > 0 && editable && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Still missing</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {missing.map((item) => (
              <li key={item}>
                <button type="button" onClick={() => onEdit(item === 'profile' ? 'details' : 'documents')} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-2xs hover:underline">
                  {item === 'profile' ? 'Your details' : DOCUMENT_INFO[item as keyof typeof DOCUMENT_INFO]?.title ?? item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editable && (
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">By sending, you confirm the documents are yours and genuine. False documents mean a permanent ban.</p>
          <Button size="lg" onClick={handleSubmit} disabled={missing.length > 0 || submit.isPending}><Send /> {submit.isPending ? 'Sending…' : rider.status === 'rejected' ? 'Send again' : 'Send for review'}</Button>
        </div>
      )}
    </div>
  );
}

export function RiderOnboardingPage() {
  const { data: rider, isLoading } = useMyRider();
  const [step, setStep] = useState<Step>('details');

  if (isLoading || !rider) return <PageBody><Skeleton className="h-96 w-full rounded-2xl" /></PageBody>;

  const docsEditable = rider.status === 'draft' || rider.status === 'rejected';
  const byKind = new Map(rider.documents.filter((doc) => doc.kind !== 'other').map((doc) => [doc.kind, doc]));
  const steps = [
    { key: 'details' as const, label: 'Details', done: !rider.missing_steps.includes('profile') },
    { key: 'location' as const, label: 'Location', done: rider.latitude !== null },
    { key: 'documents' as const, label: 'Documents', done: REQUIRED_DOCUMENT_KINDS.every((kind) => byKind.has(kind)) },
    { key: 'review' as const, label: 'Send', done: rider.status !== 'draft' && rider.status !== 'rejected' }
  ];

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Partner application" description="Takes about 5 minutes. Keep your licence, RC and ID handy." />
      <PageBody>
        <ApplicationStatusCard rider={rider} />
        <StepTabs<Step> steps={steps} current={step} onChange={setStep} />

        {step === 'details' && <RiderProfileForm rider={rider} submitLabel="Save and continue" onSaved={() => setStep('location')} />}

        {step === 'location' && (
          <div className="flex flex-col gap-5">
            <BaseLocationCard rider={rider} />
            <div className="flex justify-end"><Button size="lg" onClick={() => setStep('documents')} className="w-full sm:w-auto">Continue</Button></div>
          </div>
        )}

        {step === 'documents' && (
          <div className="flex flex-col gap-5">
            <FormSection icon={FileCheck2} title="Required documents" description="Clear photos, all four corners visible, no glare. PDFs up to 3MB.">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                {REQUIRED_DOCUMENT_KINDS.map((kind) => <DocumentTile key={kind} kind={kind} current={byKind.get(kind)} disabled={!docsEditable} />)}
              </div>
            </FormSection>
            <FormSection icon={FileCheck2} title="Optional documents" description="Licence back, insurance and anything else that helps us verify you faster.">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {OPTIONAL_DOCUMENT_KINDS.map((kind) => <DocumentTile key={kind} kind={kind} current={byKind.get(kind)} disabled={!docsEditable} />)}
                </div>
                <OtherDocuments documents={rider.documents.filter((doc) => doc.kind === 'other')} canRemove={docsEditable} />
              </div>
            </FormSection>
            <div className="flex justify-end"><Button size="lg" onClick={() => setStep('review')} className="w-full sm:w-auto">Review application</Button></div>
          </div>
        )}

        {step === 'review' && <ReviewStep rider={rider} onEdit={setStep} />}
      </PageBody>
    </div>
  );
}
