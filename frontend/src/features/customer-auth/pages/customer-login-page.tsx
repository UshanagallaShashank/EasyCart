// Customer login page with floating card on sky background
import { Link, useSearchParams } from 'react-router-dom';
import { CustomerLoginForm } from '../components/customer-login-form';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSkyBackground } from '@/features/auth/components/auth-sky-background';
import { AuthCardHeader } from '@/features/auth/components/auth-card-header';

export function CustomerLoginPage() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect');
  const regLink = redirect ? `/customer/register?redirect=${encodeURIComponent(redirect)}` : '/customer/register';

  return (
    <div className="relative min-h-svh flex flex-col justify-between p-6 overflow-hidden">
      <AuthSkyBackground />
      <main className="w-full flex items-center justify-center my-auto py-8">
        <AuthCard>
          <AuthCardHeader title="Sign in to your account" subtitle="Track orders, manage addresses, and checkout faster." />
          <CustomerLoginForm />
          <p className="text-center text-xs text-slate-500 pt-1">
            New customer? <Link to={regLink} className="text-sky-600 font-semibold hover:underline">Register</Link>
          </p>
        </AuthCard>
      </main>
      <footer className="text-center text-[11px] text-slate-400 py-2">EasyCart &copy; 2026</footer>
    </div>
  );
}
