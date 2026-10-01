// Customer registration page; keeps the post-signup redirect when linking back to login.
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { CustomerRegisterForm } from '../components/customer-register-form';

export function CustomerRegisterPage() {
  const redirect = useSearchParams()[0].get('redirect');
  const loginLink = redirect ? `/customer/login?redirect=${encodeURIComponent(redirect)}` : '/customer/login';

  return (
    <AuthLayout
      variant="customer"
      title="Create your account"
      subtitle="One account for tracking orders and faster checkout."
      footer={<>Already have an account? <Link to={loginLink} className="font-semibold text-sky-700 hover:underline">Sign in</Link></>}
    >
      <CustomerRegisterForm />
    </AuthLayout>
  );
}
