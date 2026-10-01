// Platform admin sign-in form.
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/api-error';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { EmailField } from '@/features/auth/components/email-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { useAdminLogin } from '../hooks/use-admin-login';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAdminLogin();

  function handle_submit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ email, password }, { onError: (err) => toast.error(err instanceof ApiError || err instanceof Error ? err.message : 'Login failed') });
  }

  return (
    <form onSubmit={handle_submit} className="flex flex-col gap-3.5">
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} />
      <AuthSubmitButton isPending={login.isPending} pendingLabel="Signing in…">Sign In</AuthSubmitButton>
    </form>
  );
}
