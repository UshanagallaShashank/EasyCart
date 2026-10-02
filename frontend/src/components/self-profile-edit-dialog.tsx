// Dialog allowing a logged-in user (admin, owner, or customer) to edit their own profile.
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateSelfProfile } from '@/shared/auth/profile-api';
import { toast } from 'sonner';

interface SelfProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    username?: string;
    email?: string;
    phone_number?: string;
  };
  authType?: 'owner' | 'customer';
  onSuccess?: (updatedUser: any) => void;
}

export function SelfProfileEditDialog({
  open,
  onOpenChange,
  initialData,
  authType = 'owner',
  onSuccess
}: SelfProfileEditDialogProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUsername(initialData.username || '');
      setEmail(initialData.email || '');
      setPhoneNumber(
        initialData.phone_number && initialData.phone_number !== 'undefined'
          ? initialData.phone_number
          : ''
      );
      setError(null);
    }
  }, [open, initialData]);

  const isDirty =
    username !== (initialData.username || '') ||
    email !== (initialData.email || '') ||
    phoneNumber !==
      (initialData.phone_number && initialData.phone_number !== 'undefined'
        ? initialData.phone_number
        : '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const res = await updateSelfProfile(
        {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          phone_number: phoneNumber.trim()
        },
        authType
      );
      toast.success(res.message || 'Profile updated successfully');
      onSuccess?.(res.user);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-extrabold text-slate-900">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Update your account details and contact information.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="self-username" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="size-3.5 text-slate-400" /> Username
            </Label>
            <Input
              id="self-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. your_name"
              required
              className="rounded-xl h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="self-email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="size-3.5 text-slate-400" /> Email address
            </Label>
            <Input
              id="self-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="rounded-xl h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="self-phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="size-3.5 text-slate-400" /> Phone number
            </Label>
            <Input
              id="self-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              className="rounded-xl h-10 text-sm"
            />
          </div>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || isPending}
              className="rounded-xl gap-2 font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
