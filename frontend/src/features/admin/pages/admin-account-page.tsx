// Signed-in admin's profile, how to add another admin (passcode-gated sign-up), and session controls.
import { useState } from 'react';
import { KeyRound, LogOut, Mail, ShieldCheck, User, Phone, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/auth/auth-context';
import { AdminPageTitle } from '../components/page-title';
import { CopyButton } from '../components/copy-button';
import { StoreCategoryManager } from '../components/store-category-manager';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import { SelfProfileEditDialog } from '@/components/self-profile-edit-dialog';

export function AdminAccountPage() {
  const { user, logout, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const signupLink = `${window.location.origin}/admin/register`;
  const profile = [
    { icon: User, label: 'Username', value: user?.username },
    { icon: Mail, label: 'Email', value: user?.email },
    { icon: Phone, label: 'Phone', value: user?.phone_number && user.phone_number !== 'undefined' ? user.phone_number : '—' },
    { icon: ShieldCheck, label: 'Role', value: 'Platform admin' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Account & access" description="Your admin profile, platform settings, and store category management." />
      
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Your profile</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="h-8 gap-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-sky-700 hover:border-sky-300 rounded-xl cursor-pointer"
            >
              <Edit className="size-3.5" /> Edit Profile
            </Button>
          </div>
          <dl className="mt-3 divide-y divide-slate-100">{profile.map((p) => <div key={p.label} className="flex items-center gap-3 py-3"><p.icon className="size-4 text-slate-400" /><dt className="w-24 text-sm text-slate-500">{p.label}</dt><dd className="min-w-0 truncate text-sm font-medium text-slate-900">{p.value ?? '—'}</dd></div>)}</dl>
          <div className="mt-3 flex items-center justify-between">
            <LogoutConfirmDialog
              role="admin"
              onConfirm={logout}
              trigger={
                <Button variant="outline" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer">
                  <LogOut className="size-4" /> Log out
                </Button>
              }
            />
          </div>
        </section>

        <SelfProfileEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initialData={{
            username: user?.username,
            email: user?.email,
            phone_number: user?.phone_number
          }}
          authType="owner"
          onSuccess={(updated) => updateUser(updated)}
        />
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

      {/* Dynamic Store Category Manager */}
      <StoreCategoryManager />
    </div>
  );
}
