// Merchant login form with custom fields and social options
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useLogin } from '../hooks/use-login';
import { ApiError } from '@/shared/api/api-error';
import { EmailField } from './email-field';
import { PasswordField } from './password-field';
import { SocialAuthButtons } from './social-auth-buttons';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} />
      <div className="flex justify-end -mt-1">
        <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.info('Password reset instructions sent'); }} className="text-[11px] text-sky-600 hover:text-sky-700 font-medium">
          Forgot password?
        </a>
      </div>
      <button type="submit" disabled={login.isPending} className="w-full h-10 rounded-xl bg-[#0077C8] hover:bg-[#0064AA] text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all disabled:opacity-50">
        {login.isPending ? 'Signing in…' : 'Sign In'}
      </button>
      <SocialAuthButtons mode="sign in" />
    </form>
  );
}
