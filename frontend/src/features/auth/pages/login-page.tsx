// Merchant login page with floating card on serene sky background
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/login-form';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSkyBackground } from '../components/auth-sky-background';
import { AuthCardHeader } from '../components/auth-card-header';

export function LoginPage() {
  return (
    <div className="relative min-h-svh flex flex-col justify-between p-6 overflow-hidden">
      <AuthSkyBackground />
      <main className="w-full flex items-center justify-center my-auto py-8">
        <AuthCard>
          <AuthCardHeader title="Sign in to Easy Cart" subtitle="Your effortless shopping companion." />
          <LoginForm />
          <p className="text-center text-xs text-slate-500 pt-1">
            New here? <Link to="/register" className="text-sky-600 font-semibold hover:underline">Create an account</Link>
          </p>
          <p className="text-center text-[11px] text-slate-400 -mt-2">
            Ride a bike? <Link to="/rider/register" className="text-sky-600 font-semibold hover:underline">Become a delivery partner</Link>
          </p>
        </AuthCard>
      </main>
      <footer className="text-center text-[11px] text-slate-400 py-2">
        EasyCart &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
