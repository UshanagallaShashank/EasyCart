// Platform admin sign-up page, gated by the server's admin passcode.
import { Link } from 'react-router-dom';
import { AdminAuthShell } from '../components/admin-auth-shell';
import { AdminRegisterForm } from '../components/admin-register-form';

export function AdminRegisterPage() {
  return (
    <AdminAuthShell
      title="Create admin account"
      subtitle="Requires the admin passcode set on the server."
      footer={<>Already an admin? <Link to="/admin/login" className="font-semibold text-sky-300 hover:underline">Sign in</Link></>}
    >
      <AdminRegisterForm />
    </AdminAuthShell>
  );
}
