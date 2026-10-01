// Merchant registration form with store details and credentials
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useRegister } from '../hooks/use-register';
import { ApiError } from '@/shared/api/api-error';
import type { RegisterPayload } from '../types/auth-types';
import { StoreIdentityFields } from './store-identity-fields';
import { UserCredentialFields } from './user-credential-fields';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { EmailField } from './email-field';
import { PasswordField } from './password-field';
import { PasswordStrengthBar } from './password-strength-bar';
import { SocialAuthButtons } from './social-auth-buttons';

const INIT: RegisterPayload = { username: '', email: '', password: '', phone_number: '', store_name: '', slug: '' };

export function RegisterForm() {
  const [form, setForm] = useState<RegisterPayload>(INIT);
  const register = useRegister();
  const set = (k: keyof RegisterPayload, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    register.mutate(form, { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Registration failed') });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <StoreIdentityFields storeName={form.store_name} slug={form.slug} onUpdate={set} />
      <UserCredentialFields username={form.username} phone={form.phone_number} onUpdate={set} usernamePlaceholder="Owner username" />
      <EmailField value={form.email} onChange={(v) => set('email', v)} />
      <PasswordField value={form.password} onChange={(v) => set('password', v)} placeholder="Create password" />
      <PasswordStrengthBar password={form.password} />
      <AuthSubmitButton isPending={register.isPending} pendingLabel="Launching store…" className="mt-1">Create Store</AuthSubmitButton>
      <SocialAuthButtons mode="sign up" />
    </form>
  );
}
