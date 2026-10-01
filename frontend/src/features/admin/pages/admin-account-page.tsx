// Signed-in admin's profile, how to add another admin (passcode-gated sign-up), and session controls.
import { KeyRound, LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/auth/auth-context';
import { AdminPageTitle } from '../components/page-title';
import { CopyButton } from '../components/copy-button';

import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';

export function AdminAccountPage() {
  const { user, logout } = useAuth();
  const signupLink = `${window.location.origin}/admin/register`;
  const profile = [{ icon: User, label: 'Username', value: user?.username }, { icon: Mail, label: 'Email', value: user?.email }, { icon: ShieldCheck, label: 'Role', value: 'Platform admin' }];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Account & access" description="Your admin profile, and how new admins get access." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-900">Your profile</h2>
          <dl className="mt-3 divide-y divide-slate-100">{profile.map((p) => <div key={p.label} className="flex items-center gap-3 py-3"><p.icon className="size-4 text-slate-400" /><dt className="w-24 text-sm text-slate-500">{p.label}</dt><dd className="min-w-0 truncate text-sm font-medium text-slate-900">{p.value ?? '—'}</dd></div>)}</dl>
          <LogoutConfirmDialog
            role="admin"
            onConfirm={logout}
            trigger={
              <Button variant="outline" className="mt-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer">
                <LogOut className="size-4" /> Log out
              </Button>
            }
          />
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><KeyRound className="size-4 text-sky-600" /> Add another admin</h2>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-slate-600">
            <li>Share the admin sign-up link below.</li>
            <li>They also need the <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">ADMIN_SIGNUP_PASSCODE</code> value from the server's environment.</li>
            <li>If the variable is empty, admin sign-up is switched off.</li>
          </ol>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-2 pl-3"><code className="min-w-0 flex-1 truncate text-xs text-slate-700">{signupLink}</code><CopyButton text={signupLink} label="Copy link" /></div>
        </section>
      </div>
    </div>
  );
}
