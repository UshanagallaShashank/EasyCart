// Customer shopper login form with styled inputs and social options
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useCustomerLogin } from '../hooks/use-customer-login';
import { ApiError } from '@/shared/api/api-error';
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button';
import { EmailField } from '@/features/auth/components/email-field';
import { PasswordField } from '@/features/auth/components/password-field';

export function CustomerLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useCustomerLogin();

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
      <AuthSubmitButton isPending={login.isPending} pendingLabel="Logging in…">Log in</AuthSubmitButton>
    </form>
  );
}
