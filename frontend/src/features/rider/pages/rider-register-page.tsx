// Delivery partner sign-up, in the same floating sky card as every other sign-in page.
// It only creates the account; the profile, vehicle and documents are filled in next, then reviewed by an admin.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BadgeCheck, Bike, IdCard, ShieldCheck } from 'lucide-react';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSkyBackground } from '@/features/auth/components/auth-sky-background';
import { AuthCardHeader } from '@/features/auth/components/auth-card-header';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { UserCredentialFields } from '@/features/auth/components/user-credential-fields';
import { EmailField } from '@/features/auth/components/email-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { PasswordStrengthBar } from '@/features/auth/components/password-strength-bar';
import { AdminIconField } from '@/features/admin-auth/components/admin-icon-field';
import { useAuth } from '@/shared/auth/auth-context';
import { ApiError } from '@/shared/api/api-error';
import { registerRider, type RiderSignupPayload } from '@/features/delivery/api/rider-api';

const INIT: RiderSignupPayload = { username: '', full_name: '', email: '', phone_number: '', password: '' };

const STEPS = [
  { icon: IdCard, text: 'Add your details and vehicle' },
  { icon: ShieldCheck, text: 'Upload licence, RC and ID' },
  { icon: BadgeCheck, text: 'Get approved, go online, earn' }
];

export function RiderRegisterPage() {
  const [form, setForm] = useState(INIT);
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = (key: keyof RiderSignupPayload, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const register = useMutation({
    mutationFn: registerRider,
    onSuccess: ({ user, token }) => {
      login(user, token);
      navigate('/rider/onboarding');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Sign-up failed')
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    register.mutate(form);
  }

  return (
    <div className="relative flex min-h-svh flex-col justify-between overflow-hidden p-6">
      <AuthSkyBackground />
      <main className="my-auto flex w-full items-center justify-center py-8">
        <AuthCard>
          <AuthCardHeader title="Deliver with Easy Cart" subtitle="Join as a delivery partner. Earn on every order you deliver near you." />
          <ul className="grid grid-cols-3 gap-2">
            {STEPS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex flex-col items-center gap-1.5 rounded-xl bg-sky-50/80 px-2 py-2.5 text-center">
                <Icon className="size-4 text-sky-600" />
                <span className="text-[10px] leading-tight font-medium text-slate-600">{text}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <AdminIconField id="full_name" icon={Bike} value={form.full_name} onChange={(v) => set('full_name', v)} placeholder="Full name (as on your licence)" />
            <UserCredentialFields username={form.username} phone={form.phone_number} onUpdate={set} usernamePlaceholder="Username" phonePlaceholder="Mobile number" />
            <EmailField value={form.email} onChange={(v) => set('email', v)} />
            <PasswordField value={form.password} onChange={(v) => set('password', v)} placeholder="Create password" />
            <PasswordStrengthBar password={form.password} />
            <AuthSubmitButton isPending={register.isPending} pendingLabel="Creating account…">Continue</AuthSubmitButton>
          </form>
          <p className="pt-1 text-center text-xs text-slate-500">
            Already a partner? <Link to="/login" className="font-semibold text-sky-600 hover:underline">Sign in</Link>
          </p>
        </AuthCard>
      </main>
      <footer className="py-2 text-center text-[11px] text-slate-400">EasyCart &copy; 2026</footer>
    </div>
  );
}
