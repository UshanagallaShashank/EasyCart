// "Write with AI": drafts a product description from its name, category and what the owner already typed.
// Shows only when the server has AI switched on; the owner can edit the draft before saving.
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api, errorMessage } from '@/lib/api';
import { useFeatures } from '@/lib/features';

export function AiDescribeButton({ name, category, notes, onWritten }: { name: string; category?: string; notes?: string; onWritten(text: string): void }) {
  const { data: features } = useFeatures();
  const toast = useToast();
  const write = useMutation({
    mutationFn: () => api<{ description: string }>('/ai/product-description', { method: 'POST', body: { name: name.trim(), category, notes: notes?.trim() || undefined } }),
    onSuccess: ({ description }) => {
      onWritten(description);
      toast('Draft written. Check it before saving.', 'success');
    },
    onError: (err) => toast(errorMessage(err, 'AI help is not available'), 'error')
  });
  if (!features?.ai) return null;
  return <Button small variant="outline" icon="sparkles" label={name.trim() ? 'Write with AI' : 'Type a name to use AI'} onPress={() => write.mutate()} loading={write.isPending} disabled={!name.trim()} />;
}
