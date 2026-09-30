// Customer shopper login form with styled inputs and social options
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useCustomerLogin } from '../hooks/use-customer-login';
import { ApiError } from '@/shared/api/api-error';
import { EmailField } from '@/features/auth/components/email-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { SocialAuthButtons } from '@/features/auth/components/social-auth-buttons';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} />
      <div className="flex justify-end -mt-1">
        <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.info('Reset link sent to email'); }} className="text-[11px] text-sky-600 hover:text-sky-700 font-medium">
          Forgot password?
        </a>
      </div>
      <button type="submit" disabled={login.isPending} className="w-full h-10 rounded-xl bg-[#0077C8] hover:bg-[#0064AA] text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all disabled:opacity-50">
        {login.isPending ? 'Logging in…' : 'Log in'}
      </button>
      <SocialAuthButtons mode="sign in" />
    </form>
  );
}
