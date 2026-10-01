// Platform admin sign-in page.
import { Link } from 'react-router-dom';
import { AdminAuthShell } from '../components/admin-auth-shell';
import { AdminLoginForm } from '../components/admin-login-form';

export function AdminLoginPage() {
  return (
    <AdminAuthShell
      title="Admin sign in"
      subtitle="For EasyCart platform administrators only."
      footer={<>Need an admin account? <Link to="/admin/register" className="font-semibold text-sky-300 hover:underline">Register with passcode</Link></>}
    >
      <AdminLoginForm />
    </AdminAuthShell>
  );
}
