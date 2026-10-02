// The one sign-up form. Normally it creates a user account; with an admin passcode it creates a platform admin instead.
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { User, KeyRound } from 'lucide-react';
import { useCustomerRegister } from '../hooks/use-customer-register';
import { useAdminRegister } from '@/features/admin-auth/hooks/use-admin-register';
import { AdminIconField } from '@/features/admin-auth/components/admin-icon-field';
import { ApiError } from '@/shared/api/api-error';
import type { CustomerRegisterPayload } from '../types/customer-auth-types';
import { UserCredentialFields } from '@/features/auth/components/user-credential-fields';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { EmailField } from '@/features/auth/components/email-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { PasswordStrengthBar } from '@/features/auth/components/password-strength-bar';
import { SocialAuthButtons } from '@/features/auth/components/social-auth-buttons';

const INIT: CustomerRegisterPayload = { username: '', email: '', password: '', phone_number: '' };

export function CustomerRegisterForm() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<CustomerRegisterPayload>(INIT);
  // The old /admin/register address opens this page with ?admin=1, so the passcode box is already showing.
  const [isAdminSignup, setIsAdminSignup] = useState(searchParams.get('admin') === '1');
  const [passcode, setPasscode] = useState('');

  const registerUser = useCustomerRegister();
  const registerAdmin = useAdminRegister();
  const isPending = registerUser.isPending || registerAdmin.isPending;
  const set = (k: keyof CustomerRegisterPayload, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (isAdminSignup) {
      registerAdmin.mutate(
        { username: form.username, email: form.email, password: form.password, passcode },
        { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Admin sign-up failed') }
      );
      return;
    }
    registerUser.mutate(form, { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Registration failed') });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {isAdminSignup ? (
        <AdminIconField id="username" icon={User} value={form.username} onChange={(v) => set('username', v)} placeholder="Admin username" />
      ) : (
        <UserCredentialFields username={form.username} phone={form.phone_number} onUpdate={set} usernamePlaceholder="Username" />
      )}
      <EmailField value={form.email} onChange={(v) => set('email', v)} />
      <PasswordField value={form.password} onChange={(v) => set('password', v)} placeholder="Create password" />
      <PasswordStrengthBar password={form.password} />

      {isAdminSignup && (
        <AdminIconField id="passcode" icon={KeyRound} type="password" value={passcode} onChange={setPasscode} placeholder="Admin passcode" />
      )}

      <AuthSubmitButton
        isPending={isPending}
        pendingLabel={isAdminSignup ? 'Creating admin…' : 'Creating account…'}
        className="mt-1"
      >
        {isAdminSignup ? 'Create Admin Account' : 'Create Account'}
      </AuthSubmitButton>

      <button
        type="button"
        onClick={() => setIsAdminSignup((current) => !current)}
        className="text-center text-[11px] font-medium text-slate-500 transition-colors hover:text-sky-700"
      >
        {isAdminSignup ? 'Not an admin? Sign up as a user' : 'Have an admin passcode?'}
      </button>

      {!isAdminSignup && <SocialAuthButtons mode="sign up" />}
    </form>
  );
}
