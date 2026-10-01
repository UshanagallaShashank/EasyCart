// Platform admin sign-up form; the server only accepts it with the passcode from its environment.
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { User, KeyRound } from 'lucide-react';
import { ApiError } from '@/shared/api/api-error';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { EmailField } from '@/features/auth/components/email-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { PasswordStrengthBar } from '@/features/auth/components/password-strength-bar';
import { useAdminRegister } from '../hooks/use-admin-register';
import type { AdminRegisterPayload } from '../types/admin-auth-types';
import { AdminIconField } from './admin-icon-field';

const INIT: AdminRegisterPayload = { username: '', email: '', password: '', passcode: '' };

export function AdminRegisterForm() {
  const [form, setForm] = useState<AdminRegisterPayload>(INIT);
  const register = useAdminRegister();
  const set = (k: keyof AdminRegisterPayload, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function handle_submit(e: FormEvent) {
    e.preventDefault();
    register.mutate(form, { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Admin sign-up failed') });
  }

  return (
    <form onSubmit={handle_submit} className="flex flex-col gap-3">
      <AdminIconField id="username" icon={User} value={form.username} onChange={(v) => set('username', v)} placeholder="Admin username" />
      <EmailField value={form.email} onChange={(v) => set('email', v)} />
      <PasswordField value={form.password} onChange={(v) => set('password', v)} placeholder="Create password" />
      <PasswordStrengthBar password={form.password} />
      <AdminIconField id="passcode" icon={KeyRound} type="password" value={form.passcode} onChange={(v) => set('passcode', v)} placeholder="Admin passcode" />
      <AuthSubmitButton isPending={register.isPending} pendingLabel="Creating admin…" className="mt-1">Create Admin Account</AuthSubmitButton>
    </form>
  );
}
