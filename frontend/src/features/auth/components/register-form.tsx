// Merchant registration form with store details and credentials
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useRegister } from '../hooks/use-register';
import { ApiError } from '@/shared/api/api-error';
import type { RegisterPayload } from '../types/auth-types';
import { StoreIdentityFields } from './store-identity-fields';
import { UserCredentialFields } from './user-credential-fields';
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
      <UserCredentialFields username={form.username} phone={form.phone_number} onUpdate={set} />
      <EmailField value={form.email} onChange={(v) => set('email', v)} />
      <PasswordField value={form.password} onChange={(v) => set('password', v)} placeholder="Create password" />
      <PasswordStrengthBar password={form.password} />
      <button type="submit" disabled={register.isPending} className="w-full h-10 mt-1 rounded-xl bg-[#0077C8] hover:bg-[#0064AA] text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all disabled:opacity-50">
        {register.isPending ? 'Launching store…' : 'Create Store'}
      </button>
      <SocialAuthButtons mode="sign up" />
    </form>
  );
}
