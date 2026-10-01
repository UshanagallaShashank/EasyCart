// Platform admin sign-up page, gated by the server's admin passcode, in the shared sky auth style.
import { Link } from 'react-router-dom';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSkyBackground } from '@/features/auth/components/auth-sky-background';
import { AuthCardHeader } from '@/features/auth/components/auth-card-header';
import { AdminRegisterForm } from '../components/admin-register-form';

export function AdminRegisterPage() {
  return (
    <div className="relative min-h-svh flex flex-col justify-between p-6 overflow-hidden">
      <AuthSkyBackground />
      <main className="w-full flex items-center justify-center my-auto py-8">
        <AuthCard>
          <AuthCardHeader title="Create an admin account" subtitle="Requires the admin passcode set on the server." />
          <AdminRegisterForm />
          <p className="text-center text-xs text-slate-500 pt-1">
            Already an admin? <Link to="/admin/login" className="text-sky-600 font-semibold hover:underline">Log in</Link>
          </p>
        </AuthCard>
      </main>
      <footer className="text-center text-[11px] text-slate-400 py-2">EasyCart &copy; 2026. All rights reserved.</footer>
    </div>
  );
}
