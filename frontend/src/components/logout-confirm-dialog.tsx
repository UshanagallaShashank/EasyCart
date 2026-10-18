// Reusable logout confirmation alert dialog with clean styling and role-aware messaging.
import { useState, type ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface LogoutConfirmDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?(open: boolean): void;
  role?: 'admin' | 'owner' | 'customer' | 'user';
  title?: string;
  description?: string;
  onConfirm(): void;
}

export function LogoutConfirmDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  role = 'user',
  title,
  description,
  onConfirm
}: LogoutConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  function handleConfirm() {
    onConfirm();
    setOpen(false);
  }

  const defaultTitle = role === 'admin'
    ? 'Log out of Admin Console?'
    : role === 'customer'
    ? 'Log out of your account?'
    : 'Are you sure you want to log out?';

  const defaultDescription = role === 'admin'
    ? 'You will need to re-enter your admin credentials to access the platform management dashboard.'
    : 'You will need to sign in again to view your orders, cart, or access your store.';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="flex flex-col items-center sm:items-start gap-2">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50 mb-1">
            <LogOut className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {title || defaultTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 text-center sm:text-left">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-semibold shadow-xs gap-1.5"
          >
            <LogOut className="size-4" /> Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
