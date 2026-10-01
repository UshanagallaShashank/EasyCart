// Platform admin login page, in the same floating-card-on-sky style as the other sign-in pages.
import { Link } from 'react-router-dom';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSkyBackground } from '@/features/auth/components/auth-sky-background';
import { AuthCardHeader } from '@/features/auth/components/auth-card-header';
import { AdminLoginForm } from '../components/admin-login-form';

export function AdminLoginPage() {
  return (
    <div className="relative min-h-svh flex flex-col justify-between p-6 overflow-hidden">
      <AuthSkyBackground />
      <main className="w-full flex items-center justify-center my-auto py-8">
        <AuthCard>
          <AuthCardHeader title="Admin sign in" subtitle="For EasyCart platform administrators only." />
          <AdminLoginForm />
          <p className="text-center text-xs text-slate-500 pt-1">
            Need an admin account? <Link to="/admin/register" className="text-sky-600 font-semibold hover:underline">Register with passcode</Link>
          </p>
        </AuthCard>
      </main>
      <footer className="text-center text-[11px] text-slate-400 py-2">EasyCart &copy; 2026. All rights reserved.</footer>
    </div>
  );
}
