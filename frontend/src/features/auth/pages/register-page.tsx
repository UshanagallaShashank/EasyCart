// Merchant store registration page.
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout';
import { RegisterForm } from '../components/register-form';

export function RegisterPage() {
  return (
    <AuthLayout
      variant="merchant"
      title="Create your store"
      subtitle="Set up your shop in a couple of minutes. You can change everything later."
      footer={<>Already have a store? <Link to="/login" className="font-semibold text-sky-700 hover:underline">Sign in</Link></>}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
