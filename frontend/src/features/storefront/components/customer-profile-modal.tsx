// Modal dialog for viewing customer profile details and quick account actions.
import { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, PackageCheck, LogOut, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import { SelfProfileEditDialog } from '@/components/self-profile-edit-dialog';
import { customerOrdersPath, getLastStoreSlug } from '../lib/customer-paths';

interface CustomerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug?: string;
}

export function CustomerProfileModal({ open, onOpenChange, slug }: CustomerProfileModalProps) {
  const { user, logout, updateUser } = useCustomerAuth();
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    onOpenChange(false);
    logout();
    toast.success('Logged out successfully');
  }

  function handleViewOrders() {
    onOpenChange(false);
    const targetSlug = slug || getLastStoreSlug();
    navigate(targetSlug ? customerOrdersPath(targetSlug) : '/');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl font-heading font-extrabold text-slate-900">
            Customer Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Your personal EasyCart customer account details
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center sm:flex-row sm:items-start gap-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 via-indigo-50/40 to-slate-50 p-4 shadow-xs">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 font-heading font-extrabold text-white text-2xl shadow-md shadow-sky-500/20">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h3 className="font-heading text-base font-bold text-slate-900 truncate">{user.username}</h3>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <ShieldCheck className="size-3 text-emerald-600" /> Verified Customer
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-2 font-medium text-slate-500">
              <User className="size-4 text-slate-400" /> Username
            </span>
            <span className="font-semibold text-slate-900">{user.username}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-2 font-medium text-slate-500">
              <Mail className="size-4 text-slate-400" /> Email
            </span>
            <span className="font-semibold text-slate-900 truncate max-w-[200px]">{user.email}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-2 font-medium text-slate-500">
              <Phone className="size-4 text-slate-400" /> Phone Number
            </span>
            <span className="font-semibold text-slate-900">{user.phone_number || 'Not provided'}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="h-10 rounded-xl gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <Edit className="size-4" /> Edit Profile
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleViewOrders}
            className="h-10 rounded-xl gap-2 font-semibold text-sky-600 border-sky-200 hover:bg-sky-50"
          >
            <PackageCheck className="size-4" /> View My Orders
          </Button>
          <LogoutConfirmDialog
            role="customer"
            onConfirm={handleLogout}
            trigger={
              <Button
                type="button"
                className="h-10 rounded-xl gap-2 font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                <LogOut className="size-4 text-white" /> <span className="text-white">Log out</span>
              </Button>
            }
          />
        </div>

        <SelfProfileEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initialData={{
            username: user.username,
            email: user.email,
            phone_number: user.phone_number
          }}
          authType="customer"
          onSuccess={(updated) => updateUser(updated)}
        />
      </DialogContent>
    </Dialog>
  );
}
