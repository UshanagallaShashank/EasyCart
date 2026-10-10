// Customer registration page with floating frosted card
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { customerLoginPath } from '@/features/storefront/lib/customer-paths';
import { CustomerRegisterForm } from '../components/customer-register-form';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSkyBackground } from '@/features/auth/components/auth-sky-background';
import { AuthCardHeader } from '@/features/auth/components/auth-card-header';

export function CustomerRegisterPage() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect');
  const { slug } = useParams<{ slug: string }>();
  const loginLink = slug ? customerLoginPath(slug, redirect) : '/login';

  return (
    <div className="relative min-h-svh flex flex-col justify-between p-6 overflow-hidden">
      <AuthSkyBackground />
      <main className="w-full flex items-center justify-center my-auto py-8">
        <AuthCard>
          <AuthCardHeader title="Create your account" subtitle="Shop from independent stores. You can request your own store any time after signing up." />
          <CustomerRegisterForm />
          <p className="text-center text-xs text-slate-500 pt-1">
            Already have an account? <Link to={loginLink} className="text-sky-600 font-semibold hover:underline">Log in</Link>
          </p>
        </AuthCard>
      </main>
      <footer className="text-center text-[11px] text-slate-400 py-2">EasyCart &copy; 2026</footer>
    </div>
  );
}
