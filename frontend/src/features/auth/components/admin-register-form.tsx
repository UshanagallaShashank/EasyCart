// Platform admin sign-up form; the server only accepts it with the passcode from its environment.
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { User, KeyRound } from 'lucide-react';
import { ApiError } from '@/shared/api/api-error';
import { useAdminRegister } from '../hooks/use-admin-register';
import type { AdminRegisterPayload } from '../types/auth-types';
import { AuthTextField } from './auth-text-field';
import { AuthSubmitButton } from './auth-submit-button';
import { EmailField } from './email-field';
import { PasswordField } from './password-field';
import { PasswordStrengthBar } from './password-strength-bar';

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
    <form onSubmit={handle_submit} className="flex flex-col gap-4">
      <AuthTextField id="username" label="Username" icon={User} value={form.username} onChange={(v) => set('username', v)} placeholder="platform_admin" autoComplete="username" />
      <EmailField value={form.email} onChange={(v) => set('email', v)} />
      <PasswordField value={form.password} onChange={(v) => set('password', v)} isNew />
      <PasswordStrengthBar password={form.password} />
      <AuthTextField id="passcode" label="Admin passcode" icon={KeyRound} type="password" value={form.passcode} onChange={(v) => set('passcode', v)} autoComplete="off" hint="Ask whoever runs the server for the ADMIN_SIGNUP_PASSCODE value." />
      <AuthSubmitButton isPending={register.isPending} pendingLabel="Creating admin…" className="mt-1">Create admin account</AuthSubmitButton>
    </form>
  );
}
