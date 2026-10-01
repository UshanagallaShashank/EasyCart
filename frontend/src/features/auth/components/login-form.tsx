// Merchant login form with custom fields and social options
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useLogin } from '../hooks/use-login';
import { ApiError } from '@/shared/api/api-error';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { EmailField } from './email-field';
import { PasswordField } from './password-field';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ email, password }, {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Login failed')
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} />
      <AuthSubmitButton isPending={login.isPending} pendingLabel="Signing in…">Sign in</AuthSubmitButton>
    </form>
  );
}
