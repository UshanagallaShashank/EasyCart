// Customer login page; keeps the post-login redirect when linking to registration.
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { CustomerLoginForm } from '../components/customer-login-form';

export function CustomerLoginPage() {
  const redirect = useSearchParams()[0].get('redirect');
  const regLink = redirect ? `/customer/register?redirect=${encodeURIComponent(redirect)}` : '/customer/register';

  return (
    <AuthLayout
      variant="customer"
      title="Sign in to your account"
      subtitle={redirect ? 'Sign in to continue to checkout.' : 'Track your orders and check out faster.'}
      footer={<>New here? <Link to={regLink} className="font-semibold text-sky-700 hover:underline">Create an account</Link></>}
    >
      <CustomerLoginForm />
    </AuthLayout>
  );
}
