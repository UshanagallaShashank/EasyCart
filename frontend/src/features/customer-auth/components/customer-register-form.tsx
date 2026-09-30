// Customer shopper registration form with styled inputs
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useCustomerRegister } from '../hooks/use-customer-register';
import { ApiError } from '@/shared/api/api-error';
import type { CustomerRegisterPayload } from '../types/customer-auth-types';
import { UserCredentialFields } from '@/features/auth/components/user-credential-fields';
import { EmailField } from '@/features/auth/components/email-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { PasswordStrengthBar } from '@/features/auth/components/password-strength-bar';
import { SocialAuthButtons } from '@/features/auth/components/social-auth-buttons';

const INIT: CustomerRegisterPayload = { username: '', email: '', password: '', phone_number: '' };

export function CustomerRegisterForm() {
  const [form, setForm] = useState<CustomerRegisterPayload>(INIT);
  const register = useCustomerRegister();
  const set = (k: keyof CustomerRegisterPayload, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    register.mutate(form, { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Registration failed') });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <UserCredentialFields username={form.username} phone={form.phone_number} onUpdate={set} />
      <EmailField value={form.email} onChange={(v) => set('email', v)} />
      <PasswordField value={form.password} onChange={(v) => set('password', v)} placeholder="Create password" />
      <PasswordStrengthBar password={form.password} />
      <button type="submit" disabled={register.isPending} className="w-full h-10 mt-1 rounded-xl bg-[#0077C8] hover:bg-[#0064AA] text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all disabled:opacity-50">
        {register.isPending ? 'Creating account…' : 'Create Account'}
      </button>
      <SocialAuthButtons mode="sign up" />
    </form>
  );
}
