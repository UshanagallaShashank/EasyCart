// Platform admin sign-up page, gated by the server's admin passcode.
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout';
import { AdminRegisterForm } from '../components/admin-register-form';

export function AdminRegisterPage() {
  return (
    <AuthLayout
      variant="admin"
      title="Create an admin account"
      subtitle="Platform admins manage every store on EasyCart. You'll need the admin passcode."
      footer={<>Already an admin? <Link to="/login" className="font-semibold text-sky-700 hover:underline">Sign in</Link></>}
    >
      <AdminRegisterForm />
    </AuthLayout>
  );
}
