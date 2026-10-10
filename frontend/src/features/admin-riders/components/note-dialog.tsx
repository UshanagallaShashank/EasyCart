// Dialog asking the admin for a short reason, used when rejecting or suspending a rider.
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NoteDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  placeholder: string;
  isPending: boolean;
  onConfirm(note: string): Promise<unknown>;
}

export function NoteDialog({ trigger, title, description, confirmLabel, placeholder, isPending, onConfirm }: NoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  async function handleConfirm() {
    try {
      await onConfirm(note.trim());
      setOpen(false);
      setNote('');
    } catch {
      // The caller already showed the error; keep the dialog open so the note is not lost.
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={placeholder} maxLength={300} rows={4} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-rose-600 text-white hover:bg-rose-700" disabled={note.trim().length < 3 || isPending} onClick={handleConfirm}>{isPending ? 'Saving…' : confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
