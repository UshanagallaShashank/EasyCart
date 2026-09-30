// Customer login page with floating card on sky background
import { Link, useSearchParams } from 'react-router-dom';
import { CustomerLoginForm } from '../components/customer-login-form';
import { AuthSkyBackground } from '@/features/auth/components/auth-sky-background';
import { AuthCardHeader } from '@/features/auth/components/auth-card-header';

export function CustomerLoginPage() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect');
  const regLink = redirect ? `/customer/register?redirect=${encodeURIComponent(redirect)}` : '/customer/register';

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 overflow-hidden">
      <AuthSkyBackground />
      <main className="w-full flex items-center justify-center my-auto py-8">
        <div className="w-full max-w-[390px] bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_20px_60px_-15px_rgba(2,132,199,0.18)] rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
          <AuthCardHeader title="Sign in to your account" subtitle="Track orders, manage addresses, and checkout faster." />
          <CustomerLoginForm />
          <p className="text-center text-xs text-slate-500 pt-1">
            New customer? <Link to={regLink} className="text-sky-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </main>
      <footer className="text-center text-[11px] text-slate-400 py-2">EasyCart &copy; 2026</footer>
    </div>
  );
}
