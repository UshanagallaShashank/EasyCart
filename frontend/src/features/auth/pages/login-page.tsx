// Merchant login page.
import { Link } from 'react-router-dom';
import { MerchantAuthLayout } from '../components/merchant-auth-layout';
import { LoginForm } from '../components/login-form';

export function LoginPage() {
  return (
    <MerchantAuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your store."
      footer={<>New to EasyCart? <Link to="/register" className="font-semibold text-sky-700 hover:underline">Create your store</Link></>}
    >
      <LoginForm />
    </MerchantAuthLayout>
  );
}
