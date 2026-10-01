// Merchant store registration page with floating frosted card
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/register-form';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSkyBackground } from '../components/auth-sky-background';
import { AuthCardHeader } from '../components/auth-card-header';

export function RegisterPage() {
  return (
    <div className="relative min-h-svh flex flex-col justify-between p-6 overflow-hidden">
      <AuthSkyBackground />
      <main className="w-full flex items-center justify-center my-auto py-8">
        <AuthCard maxWidth="max-w-[420px]">
          <AuthCardHeader title="Create your Easy Cart store" subtitle="Start your business journey in minutes." />
          <RegisterForm />
          <p className="text-center text-xs text-slate-500 pt-1">
            Already have an account? <Link to="/login" className="text-sky-600 font-semibold hover:underline">Log in</Link>
          </p>
        </AuthCard>
      </main>
      <footer className="text-center text-[11px] text-slate-400 py-2">
        EasyCart &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
