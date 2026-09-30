// Merchant store registration page with floating frosted card
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/register-form';
import { AuthSkyBackground } from '../components/auth-sky-background';
import { AuthCardHeader } from '../components/auth-card-header';

export function RegisterPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 overflow-hidden">
      <AuthSkyBackground />
      <main className="w-full flex items-center justify-center my-auto py-8">
        <div className="w-full max-w-[420px] bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_20px_60px_-15px_rgba(2,132,199,0.18)] rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
          <AuthCardHeader title="Create your Easy Cart store" subtitle="Start your business journey in minutes." />
          <RegisterForm />
          <p className="text-center text-xs text-slate-500 pt-1">
            Already have an account? <Link to="/login" className="text-sky-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </main>
      <footer className="text-center text-[11px] text-slate-400 py-2">
        EasyCart &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
